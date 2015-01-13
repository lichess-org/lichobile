'use strict';

var _ = require('lodash-node'),
    utils = require('./utils'),
    signals = require('./signals'),
    storage = require('./storage');

var lichessSri = utils.lichessSri;

var urlsPool = _.range(9021, 9030).map(function(e) {
  return window.lichess.socketEndPoint + ':' + e;
});
urlsPool.unshift(window.lichess.socketEndPoint);

var strongSocketDefaults = {
  events: {
  },
  params: {
    sri: lichessSri,
    mobile: 1
  },
  options: {
    name: 'unnamed',
    pingMaxLag: 7000, // time to wait for pong before reseting the connection
    pingDelay: 1000, // time between pong and ping
    autoReconnectDelay: 1000
  }
};

var StrongSocket = function(url, version, settings) {
  var self = this;
  self.settings = _.clone(strongSocketDefaults);
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
  self.autoReconnect = true;
  self.tryAnotherUrl = false;
  self.debug('Debug is enabled');
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
    var fullUrl = 'ws://' + self.baseUrl() + self.url + '?' + utils.serializeQueryParameters(_.assign(self.settings.params, {
      version: self.version
    }));
    self.debug('connection attempt to ' + fullUrl, true);
    try {
      if (window.WebSocket) self.ws = new window.WebSocket(fullUrl);
      else throw '[lila] no websockets available!';

      // if (self.options.debug) window.liws = self.ws;
      self.ws.onerror = function(e) {
        self.onError(e);
      };
      self.ws.onclose = function() {
        signals.disconnected.dispatch();
        if (self.autoReconnect) {
          self.debug('Will autoreconnect in ' + self.options.autoReconnectDelay);
          self.scheduleConnect(self.options.autoReconnectDelay);
        }
      };
      self.ws.onopen = function() {
        self.debug('connected to ' + fullUrl, true);
        if (self.options.onOpen) self.options.onOpen();
        self.onSuccess();
        self.pingNow();
        var resend = self.ackableMessages;
        self.ackableMessages = [];
        resend.forEach(function(x) { self.send(x.t, x.d); });
      };
      self.ws.onmessage = function(e) {
        var m = JSON.parse(e.data);
        var mData = m.d || [];

        if (m.t === 'n') self.pong();
        else self.debug(e.data);

        if (m.t === 'b') mData.forEach(function(x) { self.handle(x); });
        else self.handle(m);
      };
    } catch (e) {
      self.onError(e);
    }
    self.scheduleConnect(self.options.pingMaxLag);
  },
  send: function(t, d, o) {
    var self = this;
    var data = d || {},
    options = o || {};
    if (options.ackable)
      self.ackableMessages.push({
        t: t,
        d: d
      });
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
    this.send(t, d, { ackable: true });
  },
  scheduleConnect: function(delay) {
    var self = this;
    // self.debug('schedule connect ' + delay);
    clearTimeout(self.pingSchedule);
    clearTimeout(self.connectSchedule);
    self.connectSchedule = setTimeout(function() {
      self.tryAnotherUrl = true;
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
      case 'ack':
        self.ackableMessages = [];
        break;
      default:
        if (!self.settings.receive || !self.settings.receive(m.t, m.d)) {
          var h = self.settings.events[m.t];
          if (h) h(m.d || null, self);
          else if (!self.options.ignoreUnknownMessages) {
            self.debug('Message not supported ' + JSON.stringify(m));
          }
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
  reset: function(version) {
    this.version = version;
    this.connect();
  },
  onError: function(e) {
    var self = this;
    self.options.debug = true;
    self.debug('error: ' + JSON.stringify(e));
    self.tryAnotherUrl = true;
    signals.disconnected.dispatch();
    clearTimeout(self.pingSchedule);
  },
  onSuccess: function() {
    signals.connected.dispatch();
  },
  baseUrl: function() {
    if (window.lichess.socketEndPoint === 'socket.en.lichess.org') {
      var key = 'socket.baseUrl';
      var url = storage.get(key);
      if (!url) {
        url = urlsPool[0];
        storage.set(key, url);
      } else if (this.tryAnotherUrl) {
        this.tryAnotherUrl = false;
        url = urlsPool[(urlsPool.indexOf(url) + 1) % urlsPool.length];
        storage.set(key, url);
      }
      return url;
    }

    return window.lichess.socketEndPoint;
  },
  pingInterval: function() {
    return this.options.pingDelay + this.averageLag;
  }
};

module.exports = StrongSocket;
