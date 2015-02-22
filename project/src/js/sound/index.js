var settings = require('../settings');
var ios = require('./ios');
var android = require('./android');
var browser = require('./browser');

function shouldPlay() {
  return settings.general.sound();
}

var audio;

if (window.cordova.platformId === 'android')
  audio = android;
else if (window.cordova.platformId === 'ios')
  audio = ios;
else
  audio = browser;

module.exports = {
  move: function() {
    if (shouldPlay()) audio.move.play();
  },
  capture: function() {
    if (shouldPlay()) audio.capture.play();
  },
  dong: function() {
    if (shouldPlay()) audio.dong.play();
  }
};
