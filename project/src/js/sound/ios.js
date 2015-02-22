var sounds;

document.addEventListener('deviceready', function() {
  sounds = {
    move: new window.Media('sounds/move.aifc'),
    capture: new window.Media('sounds/capture.aifc'),
    dong: new window.Media('sounds/dong.aifc')
  };
}, false);

module.exports = {
  move: {
    play: function() { sounds.move.play(); }
  },
  capture: {
    play: function() { sounds.capture.play(); }
  },
  dong: {
    play: function() { sounds.dong.play(); }
  }
};
