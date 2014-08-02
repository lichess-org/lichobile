'use strict';

var settings = require('./settings');

var soundLib = './sounds';

function makeAudio(file, volume) {
  var a = new window.Audio(soundLib + '/' + file);
  a.volume = volume;
  return a;
}

var audio = {
  move1: makeAudio('wood_light_hit_1.mp3', 0.6),
  move2: makeAudio('wood_medium_hit_1.mp3', 0.6),
  move3: makeAudio('wood_medium_hit_2.mp3', 0.6),
  move4: makeAudio('wood_sharp_hit_1.mp3', 0.6),
  capture1: makeAudio('wood_capture_hit_1.mp3', 0.6),
  capture2: makeAudio('wood_capture_hit_and_roll.mp3', 0.6),
};

var moveChoices = ['move1', 'move2', 'move3', 'move4'];

var canPlay = !!audio.move1.canPlayType && audio.move1.canPlayType('audio/mpeg');

function shouldPlay() {
  return canPlay && settings.general.sound();
}

module.exports = {
  move: function() {
    if (shouldPlay()) {
      var move = moveChoices[Math.floor(Math.random() * moveChoices.length)];
      audio[move].play();
    }
  },
  capture: function() {
    if (shouldPlay()) audio.capture1.play();
  }
};
