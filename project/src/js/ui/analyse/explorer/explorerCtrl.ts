import * as m from 'mithril';
import redraw from '../../../utils/redraw';
import * as helper from '../../helper';
import { debounce } from 'lodash';
import backbutton from '../../../backbutton';
import explorerConfig from './explorerConfig';
import { openingXhr, tablebaseXhr } from './explorerXhr';
import { isSynthetic } from '../util';
import * as gameApi from '../../../lichess/game';
import { AnalyseCtrlInterface, ExplorerCtrlInterface, ExplorerCurrentData, ExplorerData } from '../interfaces';

function tablebaseRelevant(fen: string) {
  const parts = fen.split(/\s/);
  const pieceCount = parts[0].split(/[nbrqkp]/i).length - 1;
  const castling = parts[2];
  return pieceCount <= 6 && castling === '-';
}

export default function(root: AnalyseCtrlInterface, allow: boolean): ExplorerCtrlInterface {

  const allowed = m.prop(allow);
  const enabled = m.prop(false);
  const loading = m.prop(true);
  const failing = m.prop(false);
  const current: Mithril.Property<ExplorerCurrentData> = m.prop({
    data: null,
    fen: '',
    config: ''
  });

  function open() {
    backbutton.stack.push(close);
    helper.analyticsTrackView('Analysis Explorer');
    enabled(true);
  }

  function close(fromBB?: string) {
    if (fromBB !== 'backbutton' && enabled()) backbutton.stack.pop();
    enabled(false);
    setTimeout(() => root && root.debouncedScroll(), 200);
  }

  let cache: {[index: string]: ExplorerData} = {};

  function setResult(fen: string, config: string, data: ExplorerData) {
    cache[fen] = data;
    current({
      data,
      fen,
      config
    });
  }

  function onConfigClose(changed: boolean) {
    if (changed) {
      cache = {};
      setStep();
    }
  }

  const withGames = isSynthetic(root.data) || gameApi.replayable(root.data) || !!root.data.opponent.ai;
  const effectiveVariant: VariantKey = root.data.game.variant.key === 'fromPosition' ? 'standard' : root.data.game.variant.key;

  const config = explorerConfig.controller(root.data.game.variant, onConfigClose);
  const debouncedScroll = debounce(() => {
    document.getElementById('explorerTable').scrollTop = 0;
  }, 200);

  function handleFetchError() {
    loading(false);
    failing(true);
    redraw();
  }

  const fetchOpening = debounce((fen: string, configStr: string) => {
    return openingXhr(effectiveVariant, fen, config.data, withGames)
    .then((res: ExplorerData) => {
      res.opening = true;
      res.fen = fen;
      setResult(fen, configStr, res);
      loading(false);
      failing(false);
      redraw();
    })
    .catch(handleFetchError);
  }, 1000);

  const fetchTablebase = debounce((fen: string, configStr: string) => {
    return tablebaseXhr(root.vm.step.fen)
    .then((res: ExplorerData) => {
      res.tablebase = true;
      res.fen = fen;
      setResult(fen, configStr, res);
      loading(false);
      failing(false);
      redraw();
    })
    .catch(handleFetchError);
  }, 500);

  function fetch(fen: string, configStr: string) {
    const hasTablebase = effectiveVariant === 'standard' || effectiveVariant === 'chess960';
    if (hasTablebase && withGames && tablebaseRelevant(fen)) return fetchTablebase(fen, configStr);
    else return fetchOpening(fen, configStr);
  }

  const empty: ExplorerData = {
    opening: true,
    moves: []
  };

  function setStep() {
    if (!enabled()) return;
    const step = root.vm.step;
    const configStr = config.serialize();
    if (step.ply > 50 && !tablebaseRelevant(step.fen)) {
      setResult(step.fen, configStr, empty);
    }
    const fromCache = cache[step.fen];
    if (!fromCache) {
      loading(true);
      fetch(step.fen, configStr);
    } else {
      current({
        data: fromCache,
        fen: step.fen,
        config: configStr
      });
      loading(false);
      failing(false);
    }
    redraw();
    debouncedScroll();
  }

  return {
    allowed,
    enabled,
    setStep,
    loading,
    failing,
    config,
    withGames,
    current,
    toggle() {
      if (enabled()) close();
      else open();
      setStep();
    }
  };
}
