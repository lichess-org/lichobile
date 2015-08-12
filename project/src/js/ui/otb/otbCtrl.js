import promotion from '../shared/offlineRound/promotion';
import ground from '../shared/offlineRound/ground';
import makeData from './data';
import sound from '../../sound';
import replayCtrl from './replay/replayCtrl';
import storage from '../../storage';
import actions from './actions';
import helper from '../helper';
import m from 'mithril';

const storageKey = 'otb.current';

export default function controller(cfg) {

  helper.analyticsTrackView('On The Board');

  var save = function() {
    storage.set(storageKey, {
      data: this.data,
      situations: this.replay.situations,
      ply: this.replay.ply
    });
  }.bind(this);

  var onPromotion = function(orig, dest, role) {
    this.replay.addMove(orig, dest, role);
  };

  var userMove = function(orig, dest) {
    if (!promotion.start(this, orig, dest, onPromotion)) {
      this.replay.addMove(orig, dest);
    }
  }.bind(this);

  var onMove = function(orig, dest, capturedPiece) {
    if (!capturedPiece)
      sound.move();
    else
      sound.capture();
  };

  this.onReplayAdded = function() {
    save();
    m.redraw();
    if (this.replay.situation().finished) setTimeout(function() {
      this.actions.open();
      m.redraw();
    }.bind(this), 1000);
  }.bind(this);

  this.init = function(data, situations, ply) {
    this.data = data || makeData(cfg);
    if (!this.chessground)
      this.chessground = ground.make(this.data, this.data.game.fen, userMove, onMove);
    else ground.reload(this.chessground, this.data, this.data.game.fen);
    if (!this.replay) this.replay = new replayCtrl(this, situations, ply);
    else this.replay.init(situations, ply);
    this.replay.apply();
    if (this.actions) this.actions.close();
    else this.actions = new actions.controller(this);
  }.bind(this);

  this.initAs = function(color) {
    this.init(makeData({
      color: color
    }));
  }.bind(this);

  var saved = storage.get(storageKey);
  if (saved) this.init(saved.data, saved.situations, saved.ply);
  else this.init();

  window.plugins.insomnia.keepAwake();

  this.onunload = function() {
    window.plugins.insomnia.allowSleepAgain();
  };
}
