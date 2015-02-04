var settings = require('./settings');

function play(file) {
  var a, soundsLoc;
  soundsLoc = (window.device.platform === 'Android') ?
    '/android_asset/www/sounds' : 'sounds';
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

function shouldPlay() {
  return settings.general.sound();
}

module.exports = {
  move: function() {
    if (shouldPlay()) play(audio.move);
  },
  capture: function() {
    if (shouldPlay()) play(audio.capture);
  },
  dong: function() {
    if (shouldPlay) play(audio.dong);
  }
};
