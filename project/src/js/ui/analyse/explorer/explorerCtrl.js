import m from 'mithril';
import throttle from 'lodash/throttle';
import { controller as configCtrl } from './explorerConfig';
import { openingXhr, tablebaseXhr } from './explorerXhr';
import { isSynthetic } from '../util';
import settings from '../../../settings';
import gameApi from '../../../lichess/game';

function tablebaseRelevant(fen) {
  var parts = fen.split(/\s/);
  var pieceCount = parts[0].split(/[nbrqkp]/i).length - 1;
  var castling = parts[2];
  return pieceCount <= 6 && castling === '-';
}

export default function(root, allow) {

  const allowed = m.prop(allow);
  const enabled = settings.analyse.enableExplorer();
  const loading = m.prop(true);
  const failing = m.prop(false);
  const hoveringUci = m.prop(null);

  var cache = {};
  const onConfigClose = function() {
    m.redraw();
    cache = {};
    setNode();
  };
  const withGames = isSynthetic(root.data) || gameApi.replayable(root.data) || root.data.opponent.ai;
  const effectiveVariant = root.data.game.variant.key === 'fromPosition' ? 'standard' : root.data.game.variant.key;

  const config = configCtrl(root.data.game.variant, onConfigClose);

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
    tablebaseXhr(root.vm.node.fen).then(res => {
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

  function setNode() {
    if (!enabled()) return;
    const node = root.vm.node;
    if (node.ply > 50 && !tablebaseRelevant(node.fen)) cache[node.fen] = empty;
    if (!cache[node.fen]) {
      loading(true);
      fetch(node.fen);
    } else {
      loading(false);
      failing(false);
    }
  }

  return {
    allowed,
    enabled,
    setNode,
    loading,
    failing,
    hoveringUci,
    config,
    withGames,
    current() {
      return cache[root.vm.node.fen];
    },
    toggle() {
      enabled(!enabled());
      setNode();
      root.autoScroll();
    },
    disable() {
      if (enabled()) {
        enabled(false);
        root.autoScroll();
      }
    }
  };
}
