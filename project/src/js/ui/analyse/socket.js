import { isSynthetic } from './util';
import socket from '../../socket';

export default function(ctrl) {

  var anaMoveTimeout;
  var anaDestsTimeout;

  const anaDestsCache = {};

  if (!isSynthetic(ctrl.data)) setTimeout(function() {
    socket.send('startWatching', ctrl.data.game.id);
  }, 1000);

  const handlers = {
    step: function(data) {
      ctrl.addStep(data.step, data.path);
      clearTimeout(anaMoveTimeout);
    },
    stepFailure: function(data) {
      console.log(data);
      clearTimeout(anaMoveTimeout);
      ctrl.reset();
    },
    dests: function(data) {
      anaDestsCache[data.path] = data;
      ctrl.addDests(data.dests, data.path);
      clearTimeout(anaDestsTimeout);
    },
    destsFailure: function(data) {
      console.log(data);
      clearTimeout(anaDestsTimeout);
    }
  };

  this.receive = function(type, data) {
    if (handlers[type]) {
      handlers[type](data);
      return true;
    }
    return false;
  };

  this.sendAnaMove = function(req) {
    clearTimeout(anaMoveTimeout);
    withoutStandardVariant(req);
    socket.send('anaMove', req);
    anaMoveTimeout = setTimeout(this.sendAnaMove.bind(this, req), 3000);
  }.bind(this);

  this.sendAnaDrop = function(req) {
    clearTimeout(anaMoveTimeout);
    withoutStandardVariant(req);
    socket.send('anaDrop', req);
    anaMoveTimeout = setTimeout(this.sendAnaDrop.bind(this, req), 3000);
  }.bind(this);

  this.sendAnaDests = function(req) {
    clearTimeout(anaDestsTimeout);
    withoutStandardVariant(req);
    if (anaDestsCache[req.path]) return handlers.dest(anaDestsCache[req.path]);
    socket.send('anaDests', req);
    anaDestsTimeout = setTimeout(this.sendAnaDests.bind(this, req), 3000);
  }.bind(this);

  socket.createAnalyse(this.receive.bind(this));
}

function withoutStandardVariant(obj) {
  if (obj.variant === 'standard') delete obj.variant;
}
