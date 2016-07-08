import m from 'mithril';
import throttle from 'lodash/throttle';
import explorerConfig from './explorerConfig';
import { openingXhr, tablebaseXhr } from './explorerXhr';
import { isSynthetic } from '../util';
import gameApi from '../../../lichess/game';

function tablebaseRelevant(fen) {
  var parts = fen.split(/\s/);
  var pieceCount = parts[0].split(/[nbrqkp]/i).length - 1;
  var castling = parts[2];
  return pieceCount <= 6 && castling === '-';
}

export default function(root, allow) {

  const allowed = m.prop(allow);
  const enabled = m.prop(false);
  const loading = m.prop(true);
  const failing = m.prop(false);

  var cache = {};
  function onConfigClose() {
    m.redraw();
    cache = {};
    setStep();
  }
  const withGames = isSynthetic(root.data) || gameApi.replayable(root.data) || root.data.opponent.ai;
  const effectiveVariant = root.data.game.variant.key === 'fromPosition' ? 'standard' : root.data.game.variant.key;

  const config = explorerConfig.controller(root.data.game.variant, onConfigClose);

  const handleFetchError = function() {
    loading(false);
    failing(true);
    m.redraw();
  };

  const fetchOpening = throttle(fen => {
    openingXhr(effectiveVariant, fen, config.data, withGames).then(res => {
      res.opening = true;
      res.fen = fen;
      cache[fen] = res;
      loading(false);
      failing(false);
      m.redraw();
    }, handleFetchError);
  }, 2000);

  const fetchTablebase = throttle(fen => {
    tablebaseXhr(root.vm.step.fen).then(res => {
      res.tablebase = true;
      res.fen = fen;
      cache[fen] = res;
      loading(false);
      failing(false);
      m.redraw();
    }, handleFetchError);
  }, 500);

  const fetch = function(fen) {
    const hasTablebase = effectiveVariant === 'standard' || effectiveVariant === 'chess960';
    if (hasTablebase && withGames && tablebaseRelevant(fen)) fetchTablebase(fen);
    else fetchOpening(fen);
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
      root.vm.infosHash = '';
      root.vm.openingHash = '';
      enabled(!enabled());
      setStep();
    },
    disable() {
      if (enabled()) {
        enabled(false);
      }
    }
  };
}
