var settings = require('./settings');

function play(file, volume) {
  var a, soundsLoc;
  if (window.cordova) {
    soundsLoc = (window.device.platform === 'Android') ?
    '/android_asset/www/sounds' : 'sounds';
    a = new window.Media(soundsLoc + '/' + file, function() {
      a.release();
    }, function(err) {
      console.log(err);
    });
    a.setVolume(volume);
    a.play();
  } else {
    a = new window.Audio('sounds/' + file);
    a.volume = volume;
    a.play();
  }
}

var audio = {
  move: [ 'move.mp3', 1 ],
  capture: [ 'capture.mp3', 1 ],
  dong: [ 'dong.mp3', 1 ],
};

function shouldPlay() {
  // TODO
  // return settings.general.sound();
  return true;
}

module.exports = {
  move: function() {
    if (shouldPlay()) {
      play.apply(null, audio.move);
    }
  },
  capture: function() {
    if (shouldPlay()) play.apply(null, audio.capture);
  },
  dong: function() {
    if (shouldPlay) play.apply(null, audio.dong);
  }
};
