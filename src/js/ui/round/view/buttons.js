var round = require('../round');
var status = require('../status');
var utils = require('../../../utils');
var throttle = require('lodash-node/modern/functions/throttle');

module.exports = {
  standard: function(ctrl, condition, icon, hint, socketMsg) {
    return condition(ctrl.data) ? m('button', {
      class: 'button hint--bottom ' + socketMsg,
      'data-hint': i18n(hint),
      config: utils.ontouchend(utils.partial(ctrl.socket.send, socketMsg, null))
    }, m('span[data-icon=' + icon + ']')) : null;
  },
  forceResign: function(ctrl) {
    if (!ctrl.data.opponent.ai && ctrl.data.clock && ctrl.data.opponent.isGone && round.resignable(ctrl.data))
      return m('div.force_resign_zone', [
        i18n('theOtherPlayerHasLeftTheGameYouCanForceResignationOrWaitForHim'),
        m('br'),
        m('a.button', {
          config: utils.ontouchend(utils.partial(ctrl.socket.send, 'resign-force', null)),
        }, i18n('forceResignation')),
        m('a.button', {
          config: utils.ontouchend(utils.partial(ctrl.socket.send, 'draw-force', null)),
        }, i18n('forceDraw'))
      ]);
  },
  threefoldClaimDraw: function(ctrl) {
    if (ctrl.data.game.threefold) return m('div#claim_draw_zone', [
      i18n('threefoldRepetition'),
      m.trust('&nbsp;'),
      m('a.button', {
        config: utils.ontouchend(utils.partial(ctrl.socket.send, 'draw-claim', null))
      }, i18n('claimADraw'))
    ]);
  },
  cancelDrawOffer: function(ctrl) {
    if (ctrl.data.player.offeringDraw) return m('div.negotiation', [
      i18n('drawOfferSent') + ' ',
      m('a', {
        config: utils.ontouchend(utils.partial(ctrl.socket.send, 'draw-no', null))
      }, i18n('cancel'))
    ]);
  },
  answerOpponentDrawOffer: function(ctrl) {
    if (ctrl.data.opponent.offeringDraw) return m('div.negotiation', [
      i18n('yourOpponentOffersADraw'),
      m('br'),
      m('a.button[data-icon=E]', {
        config: utils.ontouchend(utils.partial(ctrl.socket.send, 'draw-yes', null))
      }, i18n('accept')),
      m.trust('&nbsp;'),
      m('a.button[data-icon=L]', {
        config: utils.ontouchend(utils.partial(ctrl.socket.send, 'draw-no', null))
      }, i18n('decline')),
    ]);
  },
  cancelTakebackProposition: function(ctrl) {
    if (ctrl.data.player.proposingTakeback) return m('div.negotiation', [
      i18n('takebackPropositionSent') + ' ',
      m('a', {
        config: utils.ontouchend(utils.partial(ctrl.socket.send, 'takeback-no', null))
      }, i18n('cancel'))
    ]);
  },
  answerOpponentTakebackProposition: function(ctrl) {
    if (ctrl.data.opponent.proposingTakeback) return m('div.negotiation', [
      i18n('yourOpponentProposesATakeback'),
      m('br'),
      m('a.button[data-icon=E]', {
        config: utils.ontouchend(utils.partial(ctrl.socket.send, 'takeback-yes', null))
      }, i18n('accept')),
      m.trust('&nbsp;'),
      m('a.button[data-icon=L]', {
        config: utils.ontouchend(utils.partial(ctrl.socket.send, 'takeback-no', null))
      }, i18n('decline')),
    ]);
  },
  rematch: function(ctrl) {
    if ((status.finished(ctrl.data) || status.aborted(ctrl.data)) && !ctrl.data.tournament) {
      if (ctrl.data.opponent.onGame || ctrl.data.game.perf === 'correspondence') {
        return m('a.button.hint--bottom', {
          'data-hint': i18n('playWithTheSameOpponentAgain'),
          config: utils.ontouchend(utils.partial(ctrl.socket.send, 'rematch-yes', null))
        }, i18n('rematch'));
      } else {
        return m('a.button.disabled', i18n('rematch'));
      }
    }

  },
  answerOpponentRematch: function(ctrl) {
    if (ctrl.data.opponent.offeringRematch) return [
      i18n('yourOpponentWantsToPlayANewGameWithYou'),
      m('a.glowing.button.fat.hint--bottom', {
        'data-hint': i18n('playWithTheSameOpponentAgain'),
        config: utils.ontouchend(utils.partial(ctrl.socket.send, 'rematch-yes', null))
      }, i18n('joinTheGame')),
      m('a.declineInvitation.button', {
        config: utils.ontouchend(utils.partial(ctrl.socket.send, 'rematch-no', null))
      }, i18n('declineInvitation'))
    ];
  },
  cancelRematch: function(ctrl) {
    if (ctrl.data.player.offeringRematch) return [
      i18n('rematchOfferSent'),
      m('br'),
      i18n('waitingForOpponent'),
      m('a.button', {
        config: utils.ontouchend(utils.partial(ctrl.socket.send, 'rematch-no', null))
      }, i18n('cancelRematchOffer'))
    ];
  },
  viewRematch: function(ctrl) {
    if (ctrl.data.game.rematch) return m('a.viewRematch.button[data-icon=v]', {
      href: ctrl.router.Round.watcher(ctrl.data.game.rematch, ctrl.data.opponent.color).url
    }, i18n('viewRematch'));
  },
  joinRematch: function(ctrl) {
    if (ctrl.data.game.rematch) return [
      i18n('rematchOfferAccepted'),
      m('a.button.fat.hint--bottom', {
        'data-hint': i18n('playWithTheSameOpponentAgain'),
        href: ctrl.router.Round.watcher(ctrl.data.game.rematch, ctrl.data.opponent.color).url
      }, i18n('joinTheGame'))
    ];
  },
  backToTournament: function(ctrl) {
    if (ctrl.data.tournament && ctrl.data.tournament.running) return m('a[data-icon=G].button.strong.glowing', {
      href: '/tournament/' + ctrl.data.tournament.id
    }, i18n('backToTournament'));
  },
  viewTournament: function(ctrl) {
    if (ctrl.data.tournament) return m('a.viewTournament.button', {
      href: '/tournament/' + ctrl.data.tournament.id
    }, i18n('viewTournament'));
  },
  moretime: function(ctrl) {
    if (round.moretimeable(ctrl.data)) return m('a.moretime.hint--bottom-left', {
      'data-hint': i18n('giveNbSeconds', ctrl.data.clock.moretime),
      config: utils.ontouchend(throttle(utils.partial(ctrl.socket.send, 'moretime', null), 600))
    }, m('span[data-icon=O]'));
  },
  analysis: function(ctrl) {
    if (round.replayable(ctrl.data)) return m('a.button.replay_and_analyse', {
      config: utils.ontouchend(utils.partial(ctrl.socket.send, 'rematch-no', null)),
      href: ctrl.router.Round.watcher(ctrl.data.game.id, ctrl.data.player.color).url
    }, i18n('analysis'));
  }
};
