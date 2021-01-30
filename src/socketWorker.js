var socketInstance;

var strongSocketDefaults = {
  params: {
    sri: 'overrideMe',
    mobile: 1
  },
  options: {
    name: 'unnamed',
    pingMaxLag: 9000, // time to wait for pong before reseting the connection
    pingDelay: 2500, // time between pong and ping
    autoReconnectDelay: 3500,
    ignoreUnknownMessages: true,
    sendOnOpen: null, // message to send on socket open
    registeredEvents: [],
    isAuth: false
  }
};

function StrongSocket(clientId, socketEndPoint, url, version, settings) {
  this.settings = deepmerge(strongSocketDefaults, settings);
  this.settings.params.sri = clientId;
  this.socketEndPoint = socketEndPoint;
  this.url = url;
  this.version = version;
  this.options = this.settings.options;
  this.ws = null;
  this.pingSchedule = null;
  this.connectSchedule = null;
  this.ackable = makeAckable(function(t, d) { this.send(t, d) }.bind(this));
  this.lastPingTime = Date.now();
  this.pongCount = 0;
  this.currentLag = 0;
  this.averageLag = 0;
  this.autoReconnect = true;
  this.delayedDisconnectTimeoutId = null;

  this.debug('Debug is enabled');
  this.connect();
}

StrongSocket.prototype = {

  connect: function() {
    var self = this;

    // be sure any previous ws instance is closed
    clearTimeout(self.pingSchedule);
    clearTimeout(self.connectSchedule);
    if (self.ws) self.ws.close();

    self.autoReconnect = true;
    var params = serializeQueryParameters(self.settings.params);
    if (self.version !== false && self.version !== undefined) params += (params ? '&' : '') + 'v=' + self.version;
    var fullUrl = self.socketEndPoint + self.url + '?' + params;
    self.debug('connection attempt to ' + fullUrl, true);

    self.ws = new WebSocket(fullUrl);
    self.ws.onerror = function(e) {
      self.onError(e);
    };
    self.ws.onclose = function() {
      self.debug('connection closed');
      postMessage({ topic: 'disconnected' });
      if (self.autoReconnect) {
        self.debug('Will autoreconnect in ' + self.options.autoReconnectDelay);
        self.scheduleConnect(self.options.autoReconnectDelay);
      }
    };
    self.ws.onopen = function() {
      self.debug('connected to ' + fullUrl, true);
      postMessage({ topic: 'onOpen' });
      if (self.options.sendOnOpen) self.options.sendOnOpen.forEach(function(x) { self.send(x.t, x.d, x.o); });
      self.onSuccess();
      self.pingNow();
      self.ackable.resend();
    };
    self.ws.onmessage = function(e) {
      if (e.data == 0) return self.pong();
      var msg = JSON.parse(e.data);
      var mData = msg.d || [];

      if (msg.t === 'n') self.pong();
      else self.debug(e.data);

      if (msg.t === 'b') mData.forEach(function(x) { self.handle(x); });
      else self.handle(msg);
    };
    self.scheduleConnect(self.options.pingMaxLag);
  },

  isOpen: function() {
    return this.ws && this.ws.readyState === WebSocket.OPEN;
  },

  setVersion: function(version) {
    this.version = version;
    this.connect();
  },

  send: function(t, d, o) {
    var self = this;
    var data = d || {},
    o = o || {};
    var msg = { t: t };
    if (d !== undefined) {
      if (o.withLag) d.l = Math.round(self.averageLag);
      if (o.millis !== undefined) d.s = Math.floor(o.millis * 0.1).toString(36);
      if (o.blur) d.b = 1;
      msg.d = d;
    }
    if (o.ackable) {
      msg.d = msg.d || {}; // can't ack message without data
      self.ackable.register(t, msg.d); // adds d.a, the ack ID we expect to get back
    }
    var message = JSON.stringify(msg);
    self.debug('send ' + message);
    try {
      self.ws.send(message);
    } catch (e) {
      self.debug(e);
    }
  },

  scheduleConnect: function(delay) {
    var self = this;
    // self.debug('schedule connect ' + delay);
    clearTimeout(self.pingSchedule);
    clearTimeout(self.connectSchedule);
    self.connectSchedule = setTimeout(function() {
      postMessage({ topic: 'disconnected' });
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
    var pingData = (self.options.isAuth && self.pongCount % 8 == 2) ? JSON.stringify({
      t: 'p',
      l: Math.round(0.1 * self.averageLag)
    }) : null;
    try {
      self.ws.send(pingData);
      self.lastPingTime = Date.now();
    } catch (e) {
      self.debug(e, true);
    }
    self.scheduleConnect(self.options.pingMaxLag);
  },

  pong: function() {
    var self = this;
    clearTimeout(self.connectSchedule);
    self.schedulePing(self.options.pingDelay);

    self.pongCount++;
    self.currentLag = Math.min(Date.now() - self.lastPingTime, 10000);

    // Average first 4 pings, then switch to decaying average.
    var mix = self.pongCount > 4 ? 0.1 : (1 / self.pongCount);
    self.averageLag += mix * (self.currentLag - self.averageLag);
    postMessage({ topic: 'pingInterval', payload: self.pingInterval()})
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
        self.ackable.gotAck(msg.d);
        break;
      default:
        if (self.options.registeredEvents.indexOf(msg.t) !== -1) {
          postMessage({ topic: 'handle', payload: msg });
        }
    }
  },

  debug: function(msg, always) {
    if ((always || this.options.debug) && console && console.debug) {
      console.debug('[' + this.options.name + ' ' + this.settings.params.sri + '] ' + msg);
    }
  },

  appDisconnect: function() {
    this.disconnect();
  },

  delayedDisconnect: function(delay) {
    this.delayedDisconnectTimeoutId = setTimeout(() => {
      this.disconnect();
    }, delay);
  },

  cancelDelayedDisconnect: function() {
    clearTimeout(this.delayedDisconnectTimeoutId);
    this.delayedDisconnectTimeoutId = null;
  },

  // close websocket only when all queued messages are sent
  // accepts a callback to notify when the websocket is properly closed
  disconnect: function(onDisconnected) {
    clearTimeout(this.pingSchedule);
    clearTimeout(this.connectSchedule);
    this.autoReconnect = false;

    if (this.ws) {
      // if all messages are not sent before closed just retry until so
      if (this.ws.readyState === WebSocket.OPEN && this.ws.bufferedAmount > 0) {
        this.debug('Queued messages are waiting to being sent, retrying to close...', true);
        setTimeout(this.disconnect.bind(this, onDisconnected), 2);
      } else {
        this.ws.onerror = function() {};
        this.ws.onclose = function() {};
        this.ws.onopen = function() {};
        this.ws.onmessage = function() {};
        this.ws.close();
        this.ws = null;
        this.debug('Disconnect', true);
        if (onDisconnected) setTimeout(onDisconnected, 0);
      }
    } else if (onDisconnected) {
      setTimeout(onDisconnected, 0);
    }
  },

  /**
   * When the server restarts, we don't want to overload it
   * with thousands of clients trying to reconnect as soon as possible.
   * Instead, we wait between 10 to 20 seconds before reconnecting.
   * The added random allows sampling reconnections nicely.
   */
  deploy: function() {
    this.disconnect();
    // we don't want to possibly reconnect in background, so make sure there
    // is not disconnect scheduled
    if (this.delayedDisconnectTimeoutId === null) {
      this.scheduleConnect(10 * 1000 + Math.random() * 10 * 1000);
    }
  },

  onError: function(e) {
    var self = this;
    postMessage({ topic: 'onError' });
    postMessage({ topic: 'disconnected' });
    self.options.debug = true;
    self.debug('error: ' + JSON.stringify(e));
    clearTimeout(self.pingSchedule);
  },

  onSuccess: function() {
    postMessage({ topic: 'connected' });
  },

  pingInterval: function() {
    return this.options.pingDelay + this.averageLag;
  }
};

function create(payload) {
  // don't always recreate default socket on page change
  // we don't want to do it for other sockets bc/ we want to register other
  // handlers on create
  if (socketInstance && payload.opts.options.name === 'default' &&
    socketInstance.options.name === 'default'
  ) {
    return;
  }

  if (socketInstance) {
    socketInstance.disconnect(function() {
      socketInstance = new StrongSocket(
        payload.clientId,
        payload.socketEndPoint,
        payload.url,
        payload.version,
        payload.opts
      );
    });
  } else {
    socketInstance = new StrongSocket(
      payload.clientId,
      payload.socketEndPoint,
      payload.url,
      payload.version,
      payload.opts
    );
  }
}

function doSend(socketMsg) {
  var url = socketMsg[0];
  var t = socketMsg[1];
  var d = socketMsg[2];
  var o = socketMsg[3];
  if (socketInstance && socketInstance.ws) {
    if (socketInstance.url === url || url === 'noCheck') {
      socketInstance.send(t, d, o);
    } else {
      // trying to send to the wrong URL? log it
      var wrong = {
        t: t,
        d: d,
        url: url
      }
      socketInstance.send('wrongHole', wrong);
      console.warn('[socket] wrongHole', wrong);
    }
  }
  // else console.info('socket instance is null, could not send socket msg: ', socketMsg);
}

self.onmessage = function(msg) {
  switch (msg.data.topic) {
    case 'create':
      create(msg.data.payload);
      break;
    case 'send':
      doSend(msg.data.payload);
      break;
    case 'ask':
      var event = msg.data.payload.listenTo;
      if (socketInstance &&
        socketInstance.options.registeredEvents.indexOf(event) === -1) {
        socketInstance.options.registeredEvents.push(event);
      }
      doSend(msg.data.payload.msg);
      break;
    case 'connect':
      if (socketInstance) socketInstance.connect();
      break;
    case 'disconnect':
      if (socketInstance) socketInstance.appDisconnect();
      break;
    case 'delayedDisconnect':
      if (socketInstance) socketInstance.delayedDisconnect(msg.data.payload);
      break;
    case 'cancelDelayedDisconnect':
      if (socketInstance) socketInstance.cancelDelayedDisconnect();
      break;
    case 'destroy':
      if (socketInstance) {
        socketInstance.disconnect();
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
    case 'currentLag':
      if (socketInstance) postMessage({ topic: 'currentLag', payload: socketInstance.currentLag });
      else postMessage({ topic: 'currentLag', payload: null });
      break;
    case 'getVersion':
      if (socketInstance) postMessage({ topic: 'getVersion', payload: socketInstance.version });
      else postMessage({ topic: 'getVersion', payload: null });
      break;
    case 'deploy':
      socketInstance.deploy();
      break;
    default:
      throw new Error('socker worker message not supported: ' + msg.data.topic);
  }
};


// taken from https://github.com/KyleAMathews/deepmerge/blob/master/index.js
function deepmerge(target, src) {
    var array = Array.isArray(src);
    var dst = array && [] || {};

    if (array) {
        target = target || [];
        dst = dst.concat(target);
        src.forEach(function(e, i) {
            if (typeof dst[i] === 'undefined') {
                dst[i] = e;
            } else if (typeof e === 'object') {
                dst[i] = deepmerge(target[i], e);
            } else {
                if (target.indexOf(e) === -1) {
                    dst.push(e);
                }
            }
        });
    } else {
        if (target && typeof target === 'object') {
            Object.keys(target).forEach(function (key) {
                dst[key] = target[key];
            });
        }
        Object.keys(src).forEach(function (key) {
            if (typeof src[key] !== 'object' || !src[key]) {
                dst[key] = src[key];
            }
            else {
                if (!target[key]) {
                    dst[key] = src[key];
                } else {
                    dst[key] = deepmerge(target[key], src[key]);
                }
            }
        });
    }

    return dst;
}

function serializeQueryParameters(obj) {
  var str = '';
  for (var key in obj) {
    if (str !== '') {
      str += '&';
    }
    str += encodeURIComponent(key) + '=' + encodeURIComponent(obj[key]);
  }
  return str;
}

var ackableInterval; // make sure only one is active!

function makeAckable(send) {

  var currentId = 1; // increment with each ackable message sent

  var messages = [];

  function resend() {
    var resendCutoff = Date.now() - 2500;
    messages.forEach(function(m) {
      if (m.at < resendCutoff) send(m.t, m.d);
    });
  }

  if (ackableInterval) clearInterval(ackableInterval);
  ackableInterval = setInterval(resend, 1500);

  return {
    resend: resend,
    register: function(t, d) {
      d.a = currentId++;
      messages.push({
        t: t,
        d: d,
        at: Date.now()
      });
    },
    gotAck: function(id) {
      messages = messages.filter(function(m) {
        return m.d.a !== id;
      });
    }
  };
}
