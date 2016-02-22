import m from 'mithril';
import makePool from './cevalPool';
import storage from '../../../storage';

export default function cevalCtrl(allow, emit) {

  const minDepth = 8;
  const maxDepth = 18;
  const storageKey = 'client-eval-enabled';
  const allowed = m.prop(allow);
  const enabled = m.prop(allow && storage.get(storageKey) === '1');
  const pool = makePool({
    path: '/assets/vendor/stockfish6.js', // Can't CDN because same-origin policy
    minDepth: minDepth,
    maxDepth: maxDepth
  }, 3);

  var started = false;

  function start(path, steps) {
    if (!enabled()) return;
    const step = steps[steps.length - 1];
    if (step.ceval && step.ceval.depth >= maxDepth) return;
    pool.start({
      position: steps[0].fen,
      moves: steps.slice(1).map(function(s) {
        return fixCastle(s.uci, s.san);
      }).join(' '),
      path: path,
      steps: steps,
      ply: step.ply,
      emit: function(res) {
        if (enabled()) emit(res);
      }
    });
    started = true;
  }

  function stop() {
    if (!enabled() || !started) return;
    pool.stop();
    started = false;
  }

  function fixCastle(uci, san) {
    if (san.indexOf('O-O') !== 0) return uci;
    switch (uci) {
      case 'e1h1':
        return 'e1g1';
      case 'e1a1':
        return 'e1c1';
      case 'e8h8':
        return 'e8g8';
      case 'e8a8':
        return 'e8c8';
    }
    return uci;
  }

  return {
    start: start,
    stop: stop,
    allowed: allowed,
    enabled: enabled,
    toggle: function() {
      if (!allowed()) return;
      stop();
      enabled(!enabled());
      storage.set(storageKey, enabled() ? '1' : '0');
    }
  };
}
