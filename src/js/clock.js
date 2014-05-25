'use strict';

var Clock = function(time, $el) {
  var self = this;
  self.time = time;
  self.$el = $el;
  self.isRunning = false;
  self.interval = null;

  function prefixInteger(num, length) {
    return (num / Math.pow(10, length)).toFixed(length).substr(2);
  }

  self.formatDate = function(date) {
    var minutes = prefixInteger(date.getMinutes(), 2);
    var seconds = prefixInteger(date.getSeconds(), 2);
    var tenths;
    if (self.time < 10000) {
      tenths = Math.floor(date.getMilliseconds() / 100);
      return minutes + ':' + seconds + '<span>.' + tenths + '</span>';
    } else if (self.time >= 3600000) {
      var hours = prefixInteger(date.getHours(), 2);
      return hours + ':' + minutes + ':' + seconds;
    } else {
      return minutes + ':' + seconds;
    }
  };

  self.tick = function() {
    var html = self.formatDate(new Date(self.time));
    if (html !== self.$el.html()) {
      self.$el.html(html);
    }
  };

};

Clock.prototype = {
  show: function() {
    var self = this;
    this.$el.html(self.formatDate(new Date(self.time)));
    this.$el.show();

    return this;
  },
  start: function() {
    var self = this;
    var endTime = new Date().getTime() + self.time;
    self.isRunning = true;
    self.interval = setInterval(function() {
      if (self.isRunning) {
        var currTime = endTime - new Date().getTime();
        if (currTime <= 0) {
          clearInterval(self.interval);
          currTime = 0;
        }
        self.time = currTime;
        self.tick();
      } else {
        clearInterval(self.interval);
      }
    }, 100);

    return self;
  },
  setTime: function(time) {
    this.time = Math.round(parseFloat(time) * 1000);
    this.tick();
  },
  stop: function() {
    clearInterval(this.interval);
    this.isRunning = false;

    return this;
  }
};

module.exports = Clock;
