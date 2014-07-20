'use strict';

var ko = require('knockout');

var settings = module.exports = {
  game: {
    color: ko.observable('random').extend({persist: 'settings.game.color'}),
    variant: ko.observable('1').extend({persist: 'settings.game.variant'}),
    clock: ko.observable(true).extend({persist: 'settings.game.clock'}),
    time: ko.observable(5).extend({persist: 'settings.game.time'}),
    increment: ko.observable(3).extend({persist: 'settings.game.increment'}),
    aiLevel: ko.observable(5).extend({persist: 'settings.game.aiLevel'})
  },
  general: {
    threeFoldAutoDraw: ko.observable(true).extend({persist: 'settings.threeFoldAutoDraw'}),
    disableSleep: ko.observable(true).extend({persist: 'settings.disableSleep'}),
    showLastMove: ko.observable(true).extend({persist: 'settings.showLastMove'}),
    showDests: ko.observable(true).extend({persist: 'settings.showDests'}),
    showCoords: ko.observable(true).extend({persist: 'settings.showCoords'})
  }
};

settings.general.disableSleep.subscribe(function(isDisabled) {
  if (window.cordova) {
    if (isDisabled) window.plugins.insomnia.keepAwake();
    else window.plugins.insomnia.allowSleepAgain();
  }
});
