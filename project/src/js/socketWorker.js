import merge from 'lodash/merge';
import range from 'lodash/range';
import { serializeQueryParameters } from './utils';

export default function(worker) {
  var socketInstance;

  var currentUrl;

  const strongSocketDefaults = {
    params: {
      sri: 'overrideMe',
      mobile: 1
    },
    options: {
      name: 'unnamed',
      pingMaxLag: 7000, // time to wait for pong before reseting the connection
      pingDelay: 1000, // time between pong and ping
      autoReconnectDelay: 1000,
      ignoreUnknownMessages: true,
      sendOnOpen: null, // message to send on socket open
      registeredEvents: []
    }
  };

  function StrongSocket(clientId, socketEndPoint, url, version, settings) {
    this.settings = merge({}, strongSocketDefaults, settings);
    this.settings.params.sri = clientId;
    this.socketEndPoint = socketEndPoint;
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
    this.urlsPool = [this.socketEndPoint].concat(range(9021, 9030).map(
      e => this.socketEndPoint + ':' + e
    ));

    this.debug('Debug is enabled');
    this.connect();
  }

  StrongSocket.prototype = {

    connect: function() {
      var self = this;
      self.destroy();
      self.autoReconnect = true;
      var fullUrl = 'ws://' + self.baseUrl() + self.url + '?' + serializeQueryParameters(self.settings.params);
      self.debug('connection attempt to ' + fullUrl, true);
      try {
        if (WebSocket) self.ws = new WebSocket(fullUrl);
        else throw '[lila] no websockets available!';

        self.ws.onerror = function(e) {
          self.onError(e);
        };
        self.ws.onclose = function() {
          postMessage({ topic: 'disconnected' });
          if (self.autoReconnect) {
            self.debug('Will autoreconnect in ' + self.options.autoReconnectDelay);
            self.scheduleConnect(self.options.autoReconnectDelay);
          }
        };
        self.ws.onopen = function() {
          self.debug('connected to ' + fullUrl, true);
          postMessage({ topic: 'onOpen' });
          if (self.options.sendOnOpen) self.send(self.options.sendOnOpen);
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
          if (self.options.registeredEvents.indexOf(msg.t) !== -1) {
            postMessage({ topic: 'handle', payload: msg });
          }
      }
    },

    now: function() {
      return new Date().getTime();
    },

    debug: function(msg, always) {
      if ((always || this.options.debug) && console && console.debug) {
        console.debug('[' + this.options.name + ' ' + this.settings.params.sri + ']', msg);
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
      postMessage({ topic: 'onError' });
      self.options.debug = true;
      self.debug('error: ' + JSON.stringify(e));
      self.tryAnotherUrl = true;
      postMessage({ topic: 'disconnected' });
      clearTimeout(self.pingSchedule);
    },

    onSuccess: function() {
      postMessage({ topic: 'connected' });
    },

    pingInterval: function() {
      return this.options.pingDelay + this.averageLag;
    },

    baseUrl: function() {
      if (this.socketEndPoint === 'socket.en.lichess.org') {
        if (!currentUrl) {
          currentUrl = this.urlsPool[0];
        } else if (this.tryAnotherUrl) {
          this.tryAnotherUrl = false;
          currentUrl = this.urlsPool[(this.urlsPool.indexOf(currentUrl) + 1) % this.urlsPool.length];
        }
        return currentUrl;
      }

      return this.socketEndPoint;
    }
  };

  function create(payload) {
    // don't always recreate default socket on page change
    if (socketInstance && payload.opts.options.name === 'default' &&
      socketInstance.options.name === 'default') {
      return;
    }

    if (socketInstance) {
      socketInstance.destroy();
      socketInstance = null;
    }
    socketInstance = new StrongSocket(
      payload.clientId,
      payload.socketEndPoint,
      payload.url,
      payload.version,
      payload.opts
    );
  }

  worker.addEventListener('message', function(msg) {
    switch (msg.data.topic) {
      case 'create':
        create(msg.data.payload);
        break;
      case 'send':
        var [t, d, o] = msg.data.payload;
        if (socketInstance) socketInstance.send(t, d, o);
        break;
      case 'connect':
        if (socketInstance) socketInstance.connect();
        break;
      case 'disconnect':
        if (socketInstance) socketInstance.destroy();
        break;
      case 'destroy':
        if (socketInstance) {
          socketInstance.destroy();
          socketInstance = null;
        }
        break;
      case 'setVersion':
        if (socketInstance) {
          socketInstance.setVersion(msg.data.payload);
        }
        break;
      case 'averageLag':
        if (socketInstance) postMessage({ topic: 'averageLag', payload: socketInstance.averageLag });
        else postMessage({ topic: 'averageLag', payload: null });
        break;
      default:
        throw new Error('socker worker message not supported: ' + msg.data.topic);
    }
  });
}
