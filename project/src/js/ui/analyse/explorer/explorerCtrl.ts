import * as m from 'mithril';
import redraw from '../../../utils/redraw';
import { debounce } from 'lodash';
import backbutton from '../../../backbutton';
import explorerConfig from './explorerConfig';
import { openingXhr, tablebaseXhr } from './explorerXhr';
import { isSynthetic } from '../util';
import * as gameApi from '../../../lichess/game';
import { AnalyseCtrlInterface, ExplorerCtrlInterface, ExplorerData } from '../interfaces';

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

  function open() {
    backbutton.stack.push(close);
    enabled(true);
  }

  function close(fromBB?: string) {
    if (fromBB !== 'backbutton' && enabled()) backbutton.stack.pop();
    enabled(false);
    setTimeout(() => root && root.debouncedScroll(), 200);
  }

  let cache: {[index: string]: ExplorerData} = {};
  function onConfigClose() {
    redraw();
    cache = {};
    setStep();
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

  const fetchOpening = debounce((fen: string) => {
    return openingXhr(effectiveVariant, fen, config.data, withGames)
    .then((res: ExplorerData) => {
      res.opening = true;
      res.fen = fen;
      cache[fen] = res;
      loading(false);
      failing(false);
      redraw();
    })
    .catch(handleFetchError);
  }, 1000);

  const fetchTablebase = debounce((fen: string) => {
    return tablebaseXhr(root.vm.step.fen)
    .then((res: ExplorerData) => {
      res.tablebase = true;
      res.fen = fen;
      cache[fen] = res;
      loading(false);
      failing(false);
      redraw();
    })
    .catch(handleFetchError);
  }, 500);

  const fetch = function(fen: string) {
    const hasTablebase = effectiveVariant === 'standard' || effectiveVariant === 'chess960';
    if (hasTablebase && withGames && tablebaseRelevant(fen)) return fetchTablebase(fen);
    else return fetchOpening(fen);
  };

  const empty: ExplorerData = {
    opening: true,
    moves: []
  };

  function setStep() {
    if (!enabled()) return;
    const step = root.vm.step;
    if (step.ply > 50 && !tablebaseRelevant(step.fen)) cache[step.fen] = empty;
    if (!cache[step.fen]) {
      loading(true);
      fetch(step.fen);
    } else {
      loading(false);
      failing(false);
    }
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
    current(): ExplorerData {
      return cache[root.vm.step.fen];
    },
    toggle() {
      if (enabled()) close();
      else open();
      setStep();
    }
  };
}
