import merge from 'lodash/object/merge';
import assign from 'lodash/object/assign';
import { serializeQueryParameters } from './utils';
import signals from './signals';
import { lichessSri } from './http';

const strongSocketDefaults = {
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
    autoReconnectDelay: 1000,
    ignoreUnknownMessages: true
  }
};

export default function StrongSocket(baseUrl, url, version, settings) {
  this.settings = merge({}, strongSocketDefaults, settings);
  this.baseUrl = baseUrl;
  this.url = url;
  this.version = version;
  this.options = this.settings.options;
  this.ws = null;
  this.pingSchedule = null;
  this.connectSchedule = null;
  this.ackableMessages = [];
  this.lastPingTime = this.now();
  this.currentLag = 0;
  this.averageLag = 0;
  this.autoReconnect = true;
  this.tryAnotherUrl = false;

  this.debug('Debug is enabled');
  this.connect();
}

StrongSocket.prototype = {

  connect: function() {
    var self = this;
    self.destroy();
    self.autoReconnect = true;
    var fullUrl = 'ws://' + self.baseUrl + self.url + '?' + serializeQueryParameters(assign(self.settings.params, {
      version: self.version
    }));
    self.debug('connection attempt to ' + fullUrl, true);
    try {
      if (WebSocket) self.ws = new WebSocket(fullUrl);
      else throw '[lila] no websockets available!';

      self.ws.onerror = function(e) {
        self.onError(e);
      };
      self.ws.onclose = function() {
        signals.socket.disconnected.dispatch();
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
        var msg = JSON.parse(e.data);
        var mData = msg.d || [];

        if (msg.t === 'n') self.pong();
        else self.debug(e.data);

        if (msg.t === 'b') mData.forEach(function(x) { self.handle(x); });
        else self.handle(msg);
      };
    } catch (e) {
      self.onError(e);
    }
    self.scheduleConnect(self.options.pingMaxLag);
  },

  setVersion: function(version) {
    this.version = version;
    this.connect();
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
    self.debug('send ' + message);
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
      t: 'p',
      v: this.version
    });
  },

  handle: function(msg) {
    var self = this;
    if (msg.v) {
      if (msg.v <= self.version) {
        self.debug('already has event ' + msg.v);
        return;
      }
      if (msg.v > self.version + 1) {
        self.debug('event gap detected from ' + self.version + ' to ' + msg.v);
      }
      self.version = msg.v;
    }
    switch (msg.t || false) {
      case false:
        break;
      case 'ack':
        self.ackableMessages = [];
        break;
      default:
        postMessage(msg);
    }
  },

  now: function() {
    return new Date().getTime();
  },

  debug: function(msg, always) {
    if ((always || this.options.debug) && console && console.debug) {
      console.debug('[' + this.options.name + ' ' + lichessSri + ']', msg);
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
      this.debug('Disconnect', true);
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
    if (self.options.onError) self.options.onError(e);
    self.options.debug = true;
    self.debug('error: ' + JSON.stringify(e));
    self.tryAnotherUrl = true;
    signals.socket.disconnected.dispatch();
    clearTimeout(self.pingSchedule);
  },

  onSuccess: function() {
    signals.socket.connected.dispatch();
  },

  pingInterval: function() {
    return this.options.pingDelay + this.averageLag;
  }
};
