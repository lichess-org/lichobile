'use strict';

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
  move1: [ 'wood_light_hit_1.mp3', 0.6 ],
  move2: [ 'wood_medium_hit_1.mp3', 0.6 ],
  move3: [ 'wood_medium_hit_2.mp3', 0.6 ],
  move4: [ 'wood_sharp_hit_1.mp3', 0.6 ],
  capture1: [ 'wood_capture_hit_1.mp3', 0.6 ],
  capture2: [ 'wood_capture_hit_and_roll.mp3', 0.6 ],
};

var moveChoices = ['move1', 'move2', 'move3'];

// var canPlay = window.cordova || (!!audio.move1.canPlayType && audio.move1.canPlayType('audio/mpeg'));

function shouldPlay() {
  return settings.general.sound();
}

module.exports = {
  move: function() {
    if (shouldPlay()) {
      var move = moveChoices[Math.floor(Math.random() * moveChoices.length)];
      play.apply(null, audio[move]);
    }
  },
  capture: function() {
    if (shouldPlay()) play.apply(null, audio.capture1);
  }
};
