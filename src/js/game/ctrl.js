'use strict';

var vm = require('./view-model');

module.exports = function () {
  this.vm = vm.init();
};
