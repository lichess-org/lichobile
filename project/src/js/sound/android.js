function play(file) {
  var a, soundsLoc;
  soundsLoc = '/android_asset/www/sounds';
  a = new window.Media(soundsLoc + '/' + file, function() {
    a.release();
  }, function(err) {
    console.log(err);
  });
  a.play();
}

var audio = {
  move: 'move.mp3',
  capture: 'capture.mp3',
  dong: 'dong.mp3',
};

module.exports = {
  move: {
    play: function() { play(audio.move); }
  },
  capture: {
    play: function() { play(audio.capture); }
  },
  dong: {
    play: function() { play(audio.dong); }
  }
};
