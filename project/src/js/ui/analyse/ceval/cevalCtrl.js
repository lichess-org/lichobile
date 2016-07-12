import m from 'mithril';
import settings from '../../../settings';
import cevalEngine from './cevalEngine';

export default function cevalCtrl(variant, allow, emit) {

  var initialized = false;

  const minDepth = 8;
  const maxDepth = 20;
  const allowed = m.prop(allow);

  const engine = cevalEngine({ minDepth, maxDepth });

  var curDepth = 0;
  var started = false;
  var isEnabled = settings.analyse.enableCeval();

  function enabled() {
    return allowed() && isEnabled;
  }

  function onEmit(res) {
    curDepth = res.ceval.depth;
    emit(res);
  }

  function start(path, steps) {
    if (!enabled()) {
      return;
    }
    const step = steps[steps.length - 1];
    if (step.ceval && step.ceval.depth >= maxDepth) {
      return;
    }
    engine.start({
      position: steps[0].fen,
      moves: steps.slice(1).map(function(s) {
        return fixCastle(s.uci, s.san);
      }).join(' '),
      path: path,
      steps: steps,
      ply: step.ply,
      emit: function(res) {
        if (enabled()) onEmit(res);
      }
    });
    started = true;
  }

  function stop() {
    if (!enabled() || !started) return;
    engine.stop();
    started = false;
  }

  function destroy() {
    initialized = false;
    engine.exit();
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
    init() {
      return engine.init(variant).then(() => {
        initialized = true;
      });
    },
    isInit() {
      return initialized;
    },
    start,
    stop,
    destroy,
    allowed,
    enabled,
    toggle() {
      isEnabled = settings.analyse.enableCeval();
    },
    percentComplete() {
      return Math.round(100 * curDepth / maxDepth);
    }
  };
}
