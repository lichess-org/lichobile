(function() {
  function noop() {}

  if (!window.AndroidFullScreen) {
    window.AndroidFullScreen = {};
    window.AndroidFullScreen.showSystemUI = noop;
    window.AndroidFullScreen.immersiveMode = noop;
  }

  if (!window.Stockfish) {
    var stockfishWorker;
    var listener;
    window.Stockfish = {
      init: function() {
        return new Promise(function(resolve) {
          if (stockfishWorker) {
            stockfishWorker.onmessage = msg => {
              if (listener) listener(msg.data);
            };
            setTimeout(resolve);
          } else {
            stockfishWorker = new Worker('../stockfish.js');
            stockfishWorker.onmessage = msg => {
              if (listener) listener(msg.data);
            };
            setTimeout(resolve, 10);
          }
        });
      },
      cmd: function(cmd) {
        return new Promise(function(resolve) {
          if (stockfishWorker) stockfishWorker.postMessage(cmd);
          setTimeout(resolve, 1);
        });
      },
      output: function(callback) {
        listener = callback
        if (stockfishWorker) {
          stockfishWorker.onmessage = msg => {
            if (listener) listener(msg.data);
          };
        }
      },
      exit: function() {
        return new Promise(function(resolve) {
          if (stockfishWorker) {
            stockfishWorker.terminate();
            stockfishWorker = null;
            listener = null;
          }
          setTimeout(resolve, 1);
        });
      }
    };
  }

}());

