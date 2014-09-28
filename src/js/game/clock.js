'use strict';

var m = require('mithril');

var controller = function(time, selector, initial) {
  this.isRunning = false;
  this.initialTime = initial * 1000;
  this.time = time * 1000;
  this.interval = undefined;

  this.start = function() {
    var endTime = Date.now() + this.time;
    this.isRunning = true;
    var self = this;

    this.interval = setInterval(function() {
      if (self.isRunning) {
        var currTime = endTime - Date.now();
        if (currTime <= 0) {
          currTime = 0;
          self.stop();
        }
        self.time = currTime;
        document.querySelector(selector).style.width= parseInt(self.time / self.initialTime  * 100) + "%";
        m.redraw();
      } else {
        clearInterval(self.interval);
      }
    }, 100);
  };

  this.stop = function() {
    clearInterval(this.interval);
    this.isRunning = false;
  };

  this.setTime = function(time) {
    this.time = time * 1000;
  };
};

var view = function(ctrl){

  function prefixInteger(num, length) {
    return (num / Math.pow(10, length)).toFixed(length).substr(2);
  }

  function formatDate(time) {
    var date = new Date(time);

    var minutes = prefixInteger(date.getMinutes(), 2);
    var seconds = prefixInteger(date.getSeconds(), 2);
    var tenths;

    if (time < 10000) {
      tenths = Math.floor(date.getMilliseconds() / 100);
      return seconds + '.' + tenths;
    } else if (time >= 3600000) {
      var hours = prefixInteger(date.getHours(), 2);
      return hours + ':' + minutes + ':' + seconds;
    } else {
      return minutes + ':' + seconds;
    }
  }

  return m('div.clock', [ formatDate(ctrl.time) ]);
};


module.exports = {
  controller: controller,
  view: view
};
