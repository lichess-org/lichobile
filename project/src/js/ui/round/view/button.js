var game = require('../../../lichess/game');
var gameStatus = require('../../../lichess/status');
var helper = require('../../helper');
var throttle = require('lodash-node/modern/functions/throttle');
var i18n = require('../../../i18n');

module.exports = {
  standard: function(ctrl, condition, icon, hint, socketMsg) {
    return condition(ctrl.data) ? m('button', {
      className: socketMsg,
      'data-icon': icon,
      config: helper.ontouchend(function() { ctrl.socket.send(socketMsg); })
    }, i18n(hint)) : null;
  },
  flipBoard: function(ctrl) {
    return m('button', {
      'data-icon': 'B',
      className: ctrl.vm.flip ? 'flipped' : '',
      config: helper.ontouchend(ctrl.flip)
    }, i18n('flipBoard'));
  },
  shareLink: function(ctrl) {
    return m('button', {
      className: 'fa fa-share-alt',
      config: helper.ontouchend(function() {
        window.plugins.socialsharing.share(null, null, null, game.publicUrl(ctrl.data));
      })
    }, i18n('shareGameURL'));
  },
  forceResign: function(ctrl) {
    return game.forceResignable(ctrl.data) ?
      m('div.force_resign_zone', [
        m('div.notice', i18n('theOtherPlayerHasLeftTheGameYouCanForceResignationOrWaitForHim')),
        m('button.binany_choice[data-icon=E]', {
          config: helper.ontouchend(function() { ctrl.socket.send('resign-force'); }),
        }, i18n('forceResignation')),
        m('button.binany_choice[data-icon=E]', {
          config: helper.ontouchend(function() { ctrl.socket.send('draw-force'); }),
        }, i18n('forceDraw'))
      ]) : null;
  },
  threefoldClaimDraw: function(ctrl) {
    return (ctrl.data.game.threefold) ? m('div.claim_draw_zone', [
      m('div.notice', i18n('threefoldRepetition')),
      m.trust('&nbsp;'),
      m('button[data-icon=E]', {
        config: helper.ontouchend(function() { ctrl.socket.send('draw-claim'); })
      }, i18n('claimADraw'))
    ]) : null;
  },
  cancelDrawOffer: function(ctrl) {
    if (ctrl.data.player.offeringDraw) return m('div.negotiation', [
      m('div.notice', i18n('drawOfferSent')),
      m('button[data-icon=L]', {
        config: helper.ontouchend(function() { ctrl.socket.send('draw-no'); })
      }, i18n('cancel'))
    ]);
  },
  answerOpponentDrawOffer: function(ctrl) {
    if (ctrl.data.opponent.offeringDraw) return m('div.negotiation', [
      m('div.notice', i18n('yourOpponentOffersADraw')),
      m('button.binany_choice[data-icon=E]', {
        config: helper.ontouchend(function() { ctrl.socket.send('draw-yes'); })
      }, i18n('accept')),
      m('button.binany_choice[data-icon=L]', {
        config: helper.ontouchend(function() { ctrl.socket.send('draw-no'); })
      }, i18n('decline')),
    ]);
  },
  cancelTakebackProposition: function(ctrl) {
    if (ctrl.data.player.proposingTakeback) return m('div.negotiation', [
      m('div.notice', i18n('takebackPropositionSent')),
      m('button[data-icon=L]', {
        config: helper.ontouchend(function() { ctrl.socket.send('takeback-no'); })
      }, i18n('cancel'))
    ]);
  },
  answerOpponentTakebackProposition: function(ctrl) {
    if (ctrl.data.opponent.proposingTakeback) return m('div.negotiation', [
      m('div.notice', i18n('yourOpponentProposesATakeback')),
      m('button.binany_choice[data-icon=E]', {
        config: helper.ontouchend(function() { ctrl.socket.send('takeback-yes'); })
      }, i18n('accept')),
      m('button.binany_choice[data-icon=L]', {
        config: helper.ontouchend(function() { ctrl.socket.send('takeback-no'); })
      }, i18n('decline')),
    ]);
  },
  rematch: function(ctrl) {
    if ((gameStatus.finished(ctrl.data) || gameStatus.aborted(ctrl.data)) &&
      !ctrl.data.tournament && !ctrl.data.opponent.offeringRematch &&
      !ctrl.data.player.offeringRematch) {
      if (ctrl.data.opponent.onGame || ctrl.data.game.perf === 'correspondence') {
        return m('button[data-icon=B]', {
          config: helper.ontouchend(function() { ctrl.socket.send('rematch-yes'); })
        }, i18n('rematch'));
      } else {
        return null;
      }
    }
  },
  answerOpponentRematch: function(ctrl) {
    if (ctrl.data.opponent.offeringRematch) return [
      m('div.notice', i18n('yourOpponentWantsToPlayANewGameWithYou')),
      m('button.binany_choice[data-icon=E]', {
        config: helper.ontouchend(function() { ctrl.socket.send('rematch-yes'); })
      }, i18n('joinTheGame')),
      m('button.binany_choice[data-icon=L]', {
        config: helper.ontouchend(function() { ctrl.socket.send('rematch-no'); })
      }, i18n('declineInvitation'))
    ];
  },
  cancelRematch: function(ctrl) {
    if (ctrl.data.player.offeringRematch) return [
      m('div.notice', i18n('rematchOfferSent')),
      i18n('waitingForOpponent'),
      m('button[data-icon=L]', {
        config: helper.ontouchend(function() { ctrl.socket.send('rematch-no'); })
      }, i18n('cancelRematchOffer'))
    ];
  },
  moretime: function(ctrl) {
    if (game.moretimeable(ctrl.data)) return m('button[data-icon=O]', {
      config: helper.ontouchend(throttle(function() { ctrl.socket.send('moretime'); }, 600))
    }, i18n('giveNbSeconds', 15));
  }
};
