import m from 'mithril';
import debounce from 'lodash/debounce';
import backbutton from '../../../backbutton';
import explorerConfig from './explorerConfig';
import { openingXhr, tablebaseXhr } from './explorerXhr';
import { isSynthetic } from '../util';
import gameApi from '../../../lichess/game';

function tablebaseRelevant(fen) {
  const parts = fen.split(/\s/);
  const pieceCount = parts[0].split(/[nbrqkp]/i).length - 1;
  const castling = parts[2];
  return pieceCount <= 6 && castling === '-';
}

export default function(root, allow) {

  const allowed = m.prop(allow);
  const enabled = m.prop(false);
  const loading = m.prop(true);
  const failing = m.prop(false);

  function open() {
    backbutton.stack.push(close);
    enabled(true);
  }

  function close(fromBB) {
    if (fromBB !== 'backbutton' && enabled()) backbutton.stack.pop();
    enabled(false);
    setTimeout(() => root && root.debouncedScroll(), 200);
  }

  var cache = {};
  function onConfigClose() {
    m.redraw();
    cache = {};
    setStep();
  }
  const withGames = isSynthetic(root.data) || gameApi.replayable(root.data) || root.data.opponent.ai;
  const effectiveVariant = root.data.game.variant.key === 'fromPosition' ? 'standard' : root.data.game.variant.key;

  const config = explorerConfig.controller(root.data.game.variant, onConfigClose);
  const debouncedScroll = debounce(() => {
    document.getElementById('explorerTable').scrollTop = 0;
  }, 200);

  function handleFetchError() {
    loading(false);
    failing(true);
    m.redraw();
  }

  const fetchOpening = debounce(fen => {
    return openingXhr(effectiveVariant, fen, config.data, withGames)
    .then(res => {
      res.opening = true;
      res.fen = fen;
      cache[fen] = res;
      loading(false);
      failing(false);
      m.redraw();
    })
    .catch(handleFetchError);
  }, 1000);

  const fetchTablebase = debounce(fen => {
    return tablebaseXhr(root.vm.step.fen)
    .then(res => {
      res.tablebase = true;
      res.fen = fen;
      cache[fen] = res;
      loading(false);
      failing(false);
      m.redraw();
    })
    .catch(handleFetchError);
  }, 500);

  const fetch = function(fen) {
    const hasTablebase = effectiveVariant === 'standard' || effectiveVariant === 'chess960';
    if (hasTablebase && withGames && tablebaseRelevant(fen)) return fetchTablebase(fen);
    else return fetchOpening(fen);
  };

  const empty = {
    opening: true,
    moves: {}
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
    current() {
      return cache[root.vm.step.fen];
    },
    toggle() {
      root.resetHashes();
      if (enabled()) close();
      else open();
      setStep();
    }
  };
}
