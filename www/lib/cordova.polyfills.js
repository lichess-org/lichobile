(function() {
  function noop() {}

  if (!window.AndroidFullScreen) {
    window.AndroidFullScreen = {};
    window.AndroidFullScreen.showSystemUI = noop;
    window.AndroidFullScreen.immersiveMode = noop;
  }

  if (!window.plugins || !window.plugins.insomnia) {
    window.plugins = {};
    window.plugins.insomnia = {};
    window.plugins.insomnia.allowSleepAgain = noop;
    window.plugins.insomnia.keepAwake = noop;
  }

  if (!window.Stockfish) {
    var stockfishWorker;
    window.Stockfish = {
      init: function() {
        return new Promise(function(resolve) {
          if (stockfishWorker) {
            setTimeout(resolve);
          } else {
            stockfishWorker = new Worker('../stockfish.js');
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
        if (stockfishWorker) {
          stockfishWorker.onmessage = msg => {
            callback(msg.data);
          };
        }
      },
      exit: function() {
        return new Promise(function(resolve) {
          if (stockfishWorker) {
            stockfishWorker.terminate();
            stockfishWorker = null;
          }
          setTimeout(resolve, 1);
        });
      }
    };
  }

}());

