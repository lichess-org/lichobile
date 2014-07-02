'use strict';

var _ = require('lodash'),
    Qajax = require('qajax');

var lichessSri = Math.random().toString(36).substring(2);

var strongSocketDefaults = {
  events: {
  },
  params: {
    sri: lichessSri
  },
  options: {
    name: "unnamed",
    pingMaxLag: 7000, // time to wait for pong before reseting the connection
    pingDelay: 1000, // time between pong and ping
    autoReconnectDelay: 1000,
    lagTag: false, // object showing ping lag
    ignoreUnknownMessages: false
  }
};

var StrongSocket = function(url, version, settings) {
  var self = this;
  self.settings = strongSocketDefaults;
  _.merge(self.settings, settings);
  self.url = url;
  self.version = version;
  self.options = self.settings.options;
  self.ws = null;
  self.pingSchedule = null;
  self.connectSchedule = null;
  self.ackableMessages = [];
  self.lastPingTime = self.now();
  self.currentLag = 0;
  self.averageLag = 0;
  self.tryOtherUrl = false;
  self.autoReconnect = true;
  self.debug('Debug is enabled');
  // if (self.options.resetUrl) {
  //   storage.remove(self.options.baseUrlKey);
  // }
  self.connect();
  window.addEventListener('unload', function() {
    self.destroy();
  });
};

StrongSocket.prototype = {
  connect: function() {
    var self = this;
    self.destroy();
    self.autoReconnect = true;
    var fullUrl = "ws://" + self.baseUrl() + self.url + "?" + Qajax.serialize(_.defaults(self.settings.params, {
      version: self.version
    }));
    self.debug("connection attempt to " + fullUrl, true);
    try {
      if (window.WebSocket) self.ws = new window.WebSocket(fullUrl);
      else throw "[lila] no websockets available!";

      // if (self.options.debug) window.liws = self.ws;
      self.ws.onerror = function(e) {
        self.onError(e);
      };
      self.ws.onclose = function() {
        if (self.autoReconnect) {
          self.debug('Will autoreconnect in ' + self.options.autoReconnectDelay);
          self.scheduleConnect(self.options.autoReconnectDelay);
        }
      };
      self.ws.onopen = function() {
        self.debug("connected to " + fullUrl, true);
        self.onSuccess();
        self.pingNow();
        var resend = self.ackableMessages;
        self.ackableMessages = [];
        _.each(resend, function(x) { self.send(x.t, x.d); });
      };
      self.ws.onmessage = function(e) {
        var m = JSON.parse(e.data);
        if (m.t === "n") {
          self.pong();
        } else if (m.t === "b") {
          _.each(m.d || [], function(x) { self.handle(x); });
        } else {
          self.handle(m);
        }
      };
    } catch (e) {
      self.onError(e);
    }
    self.scheduleConnect(self.options.pingMaxLag);
  },
  send: function(t, d) {
    var self = this;
    var data = d || {};
    var message = JSON.stringify({
      t: t,
      d: data
    });
    self.debug("send " + message);
    try {
      self.ws.send(message);
    } catch (e) {
      self.debug(e);
    }
  },
  sendAckable: function(t, d) {
    this.ackableMessages.push({
      t: t,
      d: d
    });
    this.send(t, d);
  },
  scheduleConnect: function(delay) {
    var self = this;
    // self.debug('schedule connect ' + delay);
    clearTimeout(self.pingSchedule);
    clearTimeout(self.connectSchedule);
    self.connectSchedule = setTimeout(function() {
      self.tryOtherUrl = true;
      self.connect();
    }, delay);
  },
  schedulePing: function(delay) {
    var self = this;
    clearTimeout(self.pingSchedule);
    self.pingSchedule = setTimeout(function() {
      self.pingNow();
    }, delay);
  },
  pingNow: function() {
    var self = this;
    clearTimeout(self.pingSchedule);
    clearTimeout(self.connectSchedule);
    try {
      self.ws.send(self.pingData());
      self.lastPingTime = self.now();
    } catch (e) {
      self.debug(e, true);
    }
    self.scheduleConnect(self.options.pingMaxLag);
  },
  pong: function() {
    var self = this;
    clearTimeout(self.connectSchedule);
    self.schedulePing(self.options.pingDelay);
    self.currentLag = self.now() - self.lastPingTime;
    if (!self.averageLag) self.averageLag = self.currentLag;
    else self.averageLag = 0.2 * (self.currentLag - self.averageLag) + self.averageLag;
    if (self.options.lagTag) {
      self.options.lagTag.innerHTML = '<strong>' + self.currentLag + "</strong> ms";
    }
  },
  pingData: function() {
    return JSON.stringify({
      t: "p",
      v: this.version
    });
  },
  handle: function(m) {
    var self = this;
    if (m.v) {
      if (m.v <= self.version) {
        self.debug("already has event " + m.v);
        return;
      }
      if (m.v > self.version + 1) {
        self.debug("event gap detected from " + self.version + " to " + m.v);
      }
      self.version = m.v;
    }
    switch (m.t || false) {
      case false:
        break;
      case 'resync':
        break;
      case 'ack':
        self.ackableMessages = [];
        break;
      default:
        var h = self.settings.events[m.t];
        if (_.isFunction(h)) h(m.d || null);
        else if (!self.options.ignoreUnknownMessages) {
          // self.debug('Message not supported ' + JSON.stringify(m));
        }
    }
  },
  now: function() {
    return new Date().getTime();
  },
  debug: function(msg, always) {
    if ((always || this.options.debug) && window.console && console.debug) {
      console.debug("[" + this.options.name + " " + lichessSri + "]", msg);
    }
  },
  destroy: function() {
    clearTimeout(this.pingSchedule);
    clearTimeout(this.connectSchedule);
    this.disconnect();
    this.ws = null;
  },
  disconnect: function() {
    if (this.ws) {
      this.debug("Disconnect", true);
      this.autoReconnect = false;
      this.ws.onerror = function() {};
      this.ws.onclose = function() {};
      this.ws.onopen = function() {};
      this.ws.onmessage = function() {};
      this.ws.close();
    }
  },
  onError: function(e) {
    var self = this;
    self.options.debug = true;
    self.options.lagTag.innerHTML = '<strong style="color: red;">Not connected</strong>';
    self.debug('error: ' + JSON.stringify(e));
    self.tryOtherUrl = true;
    clearTimeout(self.pingSchedule);
  },
  onSuccess: function() {
    // storage.set("wsok", 1);
  },
  baseUrl: function() {
    return window.socketEndPoint;
  },
  pingInterval: function() {
    return this.options.pingDelay + this.averageLag;
  }
};

module.exports = StrongSocket;
