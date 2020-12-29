(function() {
  function noop() {}

  if (!window.AndroidFullScreen) {
    window.AndroidFullScreen = {};
    window.AndroidFullScreen.showSystemUI = noop;
    window.AndroidFullScreen.immersiveMode = noop;
  }

}());

