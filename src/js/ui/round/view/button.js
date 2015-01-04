var game = require('../game');
var gameStatus = require('../status');
var utils = require('../../../utils');
var throttle = require('lodash-node/modern/functions/throttle');
var i18n = require('../../../i18n');

module.exports = {
  standard: function(ctrl, condition, icon, hint, socketMsg) {
    return condition(ctrl.data) ? m('button[data-icon=' + icon + ']', {
      config: utils.ontouchend(utils.partial(ctrl.socket.send, socketMsg, null))
    }, i18n(hint)) : null;
  },
  forceResign: function(ctrl) {
    return game.forceResignable(ctrl.data) ?
      m('div.force_resign_zone', [
        i18n('theOtherPlayerHasLeftTheGameYouCanForceResignationOrWaitForHim'),
        m('br'),
        m('button[data-icon=E]', {
          config: utils.ontouchend(utils.partial(ctrl.socket.send, 'resign-force', null)),
        }, i18n('forceResignation')),
        m('button[data-icon=E]', {
          config: utils.ontouchend(utils.partial(ctrl.socket.send, 'draw-force', null)),
        }, i18n('forceDraw'))
      ]) : null;
  },
  threefoldClaimDraw: function(ctrl) {
    return (ctrl.data.game.threefold) ? m('div.claim_draw_zone', [
      i18n('threefoldRepetition'),
      m.trust('&nbsp;'),
      m('button[data-icon=E]', {
        config: utils.ontouchend(utils.partial(ctrl.socket.send, 'draw-claim', null))
      }, i18n('claimADraw'))
    ]) : null;
  },
  cancelDrawOffer: function(ctrl) {
    if (ctrl.data.player.offeringDraw) return m('div.negotiation', [
      i18n('drawOfferSent') + ' ',
      m('button[data-icon=L]', {
        config: utils.ontouchend(utils.partial(ctrl.socket.send, 'draw-no', null))
      }, i18n('cancel'))
    ]);
  },
  answerOpponentDrawOffer: function(ctrl) {
    if (ctrl.data.opponent.offeringDraw) return m('div.negotiation', [
      i18n('yourOpponentOffersADraw'),
      m('br'),
      m('button[data-icon=E]', {
        config: utils.ontouchend(utils.partial(ctrl.socket.send, 'draw-yes', null))
      }, i18n('accept')),
      m.trust('&nbsp;'),
      m('button[data-icon=L]', {
        config: utils.ontouchend(utils.partial(ctrl.socket.send, 'draw-no', null))
      }, i18n('decline')),
    ]);
  },
  cancelTakebackProposition: function(ctrl) {
    if (ctrl.data.player.proposingTakeback) return m('div.negotiation', [
      i18n('takebackPropositionSent') + ' ',
      m('button[data-icon=L]', {
        config: utils.ontouchend(utils.partial(ctrl.socket.send, 'takeback-no', null))
      }, i18n('cancel'))
    ]);
  },
  answerOpponentTakebackProposition: function(ctrl) {
    if (ctrl.data.opponent.proposingTakeback) return m('div.negotiation', [
      i18n('yourOpponentProposesATakeback'),
      m('br'),
      m('button[data-icon=E]', {
        config: utils.ontouchend(utils.partial(ctrl.socket.send, 'takeback-yes', null))
      }, i18n('accept')),
      m.trust('&nbsp;'),
      m('button[data-icon=L]', {
        config: utils.ontouchend(utils.partial(ctrl.socket.send, 'takeback-no', null))
      }, i18n('decline')),
    ]);
  },
  rematch: function(ctrl) {
    if ((gameStatus.finished(ctrl.data) || gameStatus.aborted(ctrl.data)) && !ctrl.data.tournament) {
      if (ctrl.data.opponent.onGame || ctrl.data.game.perf === 'correspondence') {
        return m('button[data-icon=B]', {
          config: utils.ontouchend(utils.partial(ctrl.socket.send, 'rematch-yes', null))
        }, i18n('rematch'));
      } else {
        return null;
      }
    }
  },
  answerOpponentRematch: function(ctrl) {
    if (ctrl.data.opponent.offeringRematch) return [
      i18n('yourOpponentWantsToPlayANewGameWithYou'),
      m('button[data-icon=E]', {
        config: utils.ontouchend(utils.partial(ctrl.socket.send, 'rematch-yes', null))
      }, i18n('joinTheGame')),
      m('button[data-icon=L]', {
        config: utils.ontouchend(utils.partial(ctrl.socket.send, 'rematch-no', null))
      }, i18n('declineInvitation'))
    ];
  },
  cancelRematch: function(ctrl) {
    if (ctrl.data.player.offeringRematch) return [
      i18n('rematchOfferSent'),
      m('br'),
      i18n('waitingForOpponent'),
      m('button[data-icon=L]', {
        config: utils.ontouchend(utils.partial(ctrl.socket.send, 'rematch-no', null))
      }, i18n('cancelRematchOffer'))
    ];
  },
  joinRematch: function(ctrl) {
    if (ctrl.data.game.rematch) return [
      i18n('rematchOfferAccepted'),
      m('button[data-icon=E]', {}, i18n('joinTheGame'))
    ];
  },
  moretime: function(ctrl) {
    if (game.moretimeable(ctrl.data)) return m('button[data-icon=O]', {
      config: utils.ontouchend(throttle(utils.partial(ctrl.socket.send, 'moretime', null), 600))
    }, m('span[data-icon=O]'));
  }
};
