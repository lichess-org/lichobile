'use strict';

var ko = require('knockout');

var settings = module.exports = {
  game: {
    ai: {
      color: ko.observable('random').extend({persist: 'settings.game.ai.color'}),
      variant: ko.observable('1').extend({persist: 'settings.game.ai.variant'}),
      clock: ko.observable(true).extend({persist: 'settings.game.ai.clock'}),
      time: ko.observable(5).extend({persist: 'settings.game.ai.time'}),
      increment: ko.observable(3).extend({persist: 'settings.game.ai.increment'}),
      aiLevel: ko.observable(5).extend({persist: 'settings.game.ai.aiLevel'})
    },
    human: {
      variant: ko.observable('1').extend({persist: 'settings.game.human.variant'}),
      clock: ko.observable(true).extend({persist: 'settings.game.human.clock'}),
      timePreset: ko.observable([5, 0]).extend({persist: 'settings.game.human.timePreset'}),
      mode: ko.observable("casual").extend({persist: 'settings.game.human.mode'})
    }
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
