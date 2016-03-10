import makeWorker from './cevalWorker';

export default function cevalPool(opts, nb) {

  const workers = [];
  var token = -1;

  function getWorker() {
    if (!workers.length) {
      for (var i = 1; i <= nb; i++) {
        workers.push(makeWorker(opts, 'W' + i));
      }
    }
    token = (token + 1) % workers.length;
    return workers[token];
  }

  function stopAll() {
    workers.forEach(function(i) {
      i.stop();
    });
  }

  return {
    start: function(work) {
      stopAll();
      getWorker().start(work);
    },

    stop: stopAll,

    destroy() {
      workers.forEach(function(w) {
        w.terminate();
      });
    }
  };
}
