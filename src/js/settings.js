'use strict';

var ko = require('knockout');

var settings = module.exports = {
  color: ko.observable('random').extend({persist: 'settings.color'}),
  variant: ko.observable('1').extend({persist: 'settings.variant'}),
  clock: ko.observable(true).extend({persist: 'settings.clock'}),
  time: ko.observable(5).extend({persist: 'settings.time'}),
  increment: ko.observable(3).extend({persist: 'settings.increment'}),
  aiLevel: ko.observable(5).extend({persist: 'settings.aiLevel'}),

  disableSleep: ko.observable(true).extend({persist: 'settings.disableSleep'}),
  showLastMove: ko.observable(true).extend({persist: 'settings.showLastMove'}),
  showDests: ko.observable(true).extend({persist: 'settings.showDests'})
};

ko.applyBindings(settings);

settings.disableSleep.subscribe(function(isDisabled) {
  if (window.cordova) {
    if (isDisabled) window.plugins.insomnia.keepAwake();
    else window.plugins.insomnia.allowSleepAgain();
  }
});
