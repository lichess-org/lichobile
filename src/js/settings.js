'use strict';

var ko = require('knockout');

module.exports = {
  color: ko.observable('random').extend({persist: 'settings.color'}),
  variant: ko.observable('1').extend({persist: 'settings.variant'}),
  clock: ko.observable(true).extend({persist: 'settings.clock'}),
  time: ko.observable(5).extend({persist: 'settings.time'}),
  increment: ko.observable(3).extend({persist: 'settings.increment'}),
  aiLevel: ko.observable(5).extend({persist: 'settings.aiLevel'})
};

