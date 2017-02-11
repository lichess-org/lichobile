import * as h from 'mithril/hyperscript';
import { throttle } from 'lodash';
import { handleXhrError, hasNetwork, boardOrientation } from '../../../../utils';
import * as gameApi from '../../../../lichess/game';
import router from '../../../../router';
import gameStatus from '../../../../lichess/status';
import i18n from '../../../../i18n';
import socket from '../../../../socket';
import lobby from '../../../lobby';
import * as helper from '../../../helper';
import * as tournamentXhr from '../../../tournament/tournamentXhr';
import { getPGN } from '../roundXhr';
import OnlineRound from '../OnlineRound';

export default {
  standard: function(ctrl: OnlineRound, condition: (data: OnlineGameData) => boolean, icon: string, hint: string, socketMsg: string) {
    return condition(ctrl.data) && hasNetwork() ? h('button', {
      key: socketMsg,
      className: socketMsg,
      'data-icon': icon,
      oncreate: helper.ontap(() => { socket.send(socketMsg); })
    }, i18n(hint)) : null;
  },
  shareLink: function(ctrl: OnlineRound) {
    return h('button', {
      key: 'shareGameLink',
      oncreate: helper.ontap(() => {
        window.plugins.socialsharing.share(null, null, null, gameApi.publicUrl(ctrl.data));
      })
    }, [h('span.fa.fa-link'), i18n('shareGameURL')]);
  },
  userTVLink: function(user: User) {
    return h('button.withIcon', {
      key: `userTV_${user.username}`,
      'data-icon': '1',
      oncreate: helper.ontap(() => {
        router.set(`/@/${user.username}/tv`);
      })
    }, user.username + '\'s TV');
  },
  sharePGN: function(ctrl: OnlineRound) {
    function handler() {
      getPGN(ctrl.data.game.id)
      .then(function(PGN) {
        window.plugins.socialsharing.share(PGN);
      })
      .catch(handleXhrError);
    }
    return (
      <button key="sharePGN" oncreate={helper.ontap(handler)}>
        <span className="fa fa-share-alt" />
        {i18n('sharePGN')}
      </button>
    );
  },
  submitMove: function(ctrl: OnlineRound) {
    return (
      <div className="negotiationIcons">
        <p>{i18n('moveConfirmation')}</p>
        <button className="accept" data-icon="E"
          oncreate={helper.ontap(ctrl.submitMove.bind(undefined, true))}
        />
        <button className="decline" data-icon="L"
          oncreate={helper.ontap(ctrl.submitMove.bind(undefined, false))}
        />
      </div>
    );
  },
  resign: function(ctrl: OnlineRound) {
    return gameApi.resignable(ctrl.data) && !ctrl.vm.confirmResign ? h('button', {
      key: 'resign',
      className: 'resign',
      'data-icon': 'b',
      oncreate: helper.ontap(() => { ctrl.vm.confirmResign = true; })
    }, i18n('resign')) : null;
  },
  resignConfirmation: function(ctrl: OnlineRound) {
    return gameApi.resignable(ctrl.data) && ctrl.vm.confirmResign ? (
      <div className="negotiation">
        <div className="binary_choice_wrapper" key="resignConfirm">
          <button className="binary_choice" data-icon="E"
            oncreate={helper.ontap(() => { socket.send('resign'); })}
          >
            {i18n('resign')}
          </button>
          <button className="binary_choice" data-icon="L"
            oncreate={helper.ontap(() => { ctrl.vm.confirmResign = false; })}
          >
            {i18n('cancel')}
          </button>
        </div>
      </div>
    ) : null;
  },
  forceResign: function(ctrl: OnlineRound) {
    return gameApi.forceResignable(ctrl.data) ?
      h('div.force_resign_zone.clearfix', {
        key: 'forceResignZone'
      }, [
        h('div.notice', i18n('theOtherPlayerHasLeftTheGameYouCanForceResignationOrWaitForHim')),
        h('div.binary_choice_wrapper', [
          h('button.binary_choice.left', {
            oncreate: helper.ontap(() => { socket.send('resign-force'); })
          }, i18n('forceResignation')),
          h('button.binary_choice.right', {
            oncreate: helper.ontap(() => { socket.send('draw-force'); })
          }, i18n('forceDraw'))
        ])
      ]) : null;
  },
  threefoldClaimDraw: function(ctrl: OnlineRound) {
    return (ctrl.data.game.threefold) ? h('div.claim_draw_zone', {
      key: 'claimDrawZone'
    }, [
      h('div.notice', i18n('threefoldRepetition')),
      h.trust('&nbsp;'),
      h('button[data-icon=E]', {
        oncreate: helper.ontap(() => { socket.send('draw-claim'); })
      }, i18n('claimADraw'))
    ]) : null;
  },
  cancelDrawOffer: function(ctrl: OnlineRound) {
    if (ctrl.data.player.offeringDraw) return h('div.negotiation', {
      key: 'cancelDrawOfferZone'
    }, [
      h('div.notice', i18n('drawOfferSent')),
      h('button[data-icon=L]', {
        oncreate: helper.ontap(() => { socket.send('draw-no'); })
      }, i18n('cancel'))
    ]);
    return null;
  },
  answerOpponentDrawOffer: function(ctrl: OnlineRound) {
    if (ctrl.data.opponent.offeringDraw) return h('div.negotiation.clearfix', {
      key: 'answerDrawOfferZone'
    }, [
      h('div.notice', i18n('yourOpponentOffersADraw')),
      h('div.binary_choice_wrapper', [
        h('button.binary_choice[data-icon=E]', {
          oncreate: helper.ontap(() => { socket.send('draw-yes'); })
        }, i18n('accept')),
        h('button.binary_choice[data-icon=L]', {
          oncreate: helper.ontap(() => { socket.send('draw-no'); })
        }, i18n('decline'))
      ])
    ]);
    return null;
  },
  cancelTakebackProposition: function(ctrl: OnlineRound) {
    if (ctrl.data.player.proposingTakeback) return h('div.negotiation', {
      key: 'cancelTakebackPropositionZone'
    }, [
      h('div.notice', i18n('takebackPropositionSent')),
      h('button[data-icon=L]', {
        oncreate: helper.ontap(() => { socket.send('takeback-no'); })
      }, i18n('cancel'))
    ]);
    return null;
  },
  answerOpponentTakebackProposition: function(ctrl: OnlineRound) {
    if (ctrl.data.opponent.proposingTakeback) return h('div.negotiation.clearfix', {
      key: 'answerTakebackPropositionZone'
    }, [
      h('div.notice', i18n('yourOpponentProposesATakeback')),
      h('div.binary_choice_wrapper', [
        h('button.binary_choice[data-icon=E]', {
          oncreate: helper.ontap(() => { socket.send('takeback-yes'); })
        }, i18n('accept')),
        h('button.binary_choice[data-icon=L]', {
          oncreate: helper.ontap(() => { socket.send('takeback-no'); })
        }, i18n('decline'))
      ])
    ]);
    return null;
  },
  analysisBoard: function(ctrl: OnlineRound) {
    const d = ctrl.data;
    if (gameApi.userAnalysable(d) || gameApi.replayable(d)) {
      return h('button', {
        oncreate: helper.ontap(() => {
          socket.send('rematch-no');
          router.set(`/analyse/online/${d.game.id}/${boardOrientation(d)}`);
        })
      }, [h('span[data-icon=A].withIcon'), i18n('analysis')]);
    }
    return null;
  },
  analysisBoardIconOnly: function(ctrl: OnlineRound) {
    const d = ctrl.data;
    if (gameApi.userAnalysable(d) || gameApi.replayable(d)) {
      return h('button.action_bar_button[data-icon=A]', {
        oncreate: helper.ontap(() => {
          socket.send('rematch-no');
          router.set(`/analyse/online/${d.game.id}/${boardOrientation(d)}`);
        })
      });
    }
    return null;
  },
  newOpponent: function(ctrl: OnlineRound) {
    const d = ctrl.data;
    const newable = (gameStatus.finished(d) || gameStatus.aborted(d)) && (d.game.source === 'lobby' || d.game.source === 'pool');
    if (!ctrl.data.opponent.ai && newable) {
      return h('button[data-icon=r]', {
        oncreate: helper.ontap(() => {
          ctrl.hideActions();
          lobby.startSeeking();
        })
      }, i18n('newOpponent'));
    }
    return null;
  },
  rematch: function(ctrl: OnlineRound) {
    const d = ctrl.data;
    const rematchable = !d.game.rematch && (gameStatus.finished(d) || gameStatus.aborted(d)) && !d.game.tournamentId && !d.game.boosted && (d.opponent.onGame || (!d.clock && d.player.user && d.opponent.user));
    if (!ctrl.data.opponent.offeringRematch && !ctrl.data.player.offeringRematch && rematchable) {
      return h('button', {
        key: 'rematch',
        oncreate: helper.ontap(() => { socket.send('rematch-yes'); })
      }, [h('span.fa.fa-refresh'), i18n('rematch')]);
    } else {
      return null;
    }
  },
  answerOpponentRematch: function(ctrl: OnlineRound) {
    if (ctrl.data.opponent.offeringRematch) return h('div.negotiation.clearfix', {
      key: 'answerOpponentRematchZone'
    }, [
      h('div.notice', i18n('yourOpponentWantsToPlayANewGameWithYou')),
      h('div.binary_choice_wrapper', [
        h('button.binary_choice[data-icon=E]', {
          oncreate: helper.ontap(() => { socket.send('rematch-yes'); })
        }, i18n('joinTheGame')),
        h('button.binary_choice[data-icon=L]', {
          oncreate: helper.ontap(() => { socket.send('rematch-no'); })
        }, i18n('declineInvitation'))
      ])
    ]);
    return null;
  },
  cancelRematch: function(ctrl: OnlineRound) {
    if (ctrl.data.player.offeringRematch) return h('div.negotiation', {
      key: 'cancelRematchZone'
    }, [
      h('div.notice', i18n('rematchOfferSent')),
      h('div.notice', i18n('waitingForOpponent')),
      h('button[data-icon=L]', {
        oncreate: helper.ontap(() => { socket.send('rematch-no'); })
      }, i18n('cancelRematchOffer'))
    ]);
    return null;
  },
  moretime: function(ctrl: OnlineRound) {
    if (gameApi.moretimeable(ctrl.data)) return h('button[data-icon=O]', {
      key: 'moretime',
      oncreate: helper.ontap(throttle(() => { socket.send('moretime'); }, 600))
    }, i18n('giveNbSeconds', 15));
    return null;
  },
  flipBoard: function(ctrl: OnlineRound) {
    const className = helper.classSet({
      'action_bar_button': true,
      highlight: ctrl.vm.flip
    });
    return (
      <button className={className} data-icon="B" key="flipboard"
        oncreate={helper.ontap(ctrl.flip)} />
    );
  },
  first: function(ctrl: OnlineRound) {
    const prevPly = ctrl.vm.ply - 1;
    const enabled = ctrl.vm.ply !== prevPly && prevPly >= ctrl.firstPly();
    const className = helper.classSet({
      'action_bar_button': true,
      'fa': true,
      'fa-fast-backward': true,
      disabled: !enabled
    });
    return (
      <button className={className} key="fast-backward"
        oncreate={helper.ontap(ctrl.jumpFirst)} />
    );
  },
  backward: function(ctrl: OnlineRound) {
    const prevPly = ctrl.vm.ply - 1;
    const enabled = ctrl.vm.ply !== prevPly && prevPly >= ctrl.firstPly();
    const className = helper.classSet({
      'action_bar_button': true,
      'fa': true,
      'fa-backward': true,
      disabled: !enabled
    });
    return (
      <button className={className} key="backward"
        oncreate={helper.ontap(ctrl.jumpPrev, null, ctrl.jumpPrev)} />
    );
  },
  forward: function(ctrl: OnlineRound) {
    const nextPly = ctrl.vm.ply + 1;
    const enabled = ctrl.vm.ply !== nextPly && nextPly <= ctrl.lastPly();
    const className = helper.classSet({
      'action_bar_button': true,
      'fa': true,
      'fa-forward': true,
      disabled: !enabled
    });
    return (
      <button className={className} key="forward"
        oncreate={helper.ontap(ctrl.jumpNext, null, ctrl.jumpNext)} />
    );
  },
  last: function(ctrl: OnlineRound) {
    const nextPly = ctrl.vm.ply + 1;
    const enabled = ctrl.vm.ply !== nextPly && nextPly <= ctrl.lastPly();
    const className = helper.classSet({
      'action_bar_button': true,
      'fa': true,
      'fa-fast-forward': true,
      disabled: !enabled
    });
    return (
      <button className={className} key="fast-forward"
        oncreate={helper.ontap(ctrl.jumpLast)} />
    );
  },
  notes: function(ctrl: OnlineRound) {
    return (
      <button className="action_bar_button" data-icon="h" key="notes"
        oncreate={helper.ontap(
          ctrl.notes.open,
          () => window.plugins.toast.show(i18n('notes'), 'short', 'bottom')
        )} />
    );
  },
  returnToTournament: function(ctrl: OnlineRound) {
    function handler() {
      ctrl.hideActions();
      const url = `/tournament/${ctrl.data.game.tournamentId}`;
      if (ctrl.data.tv) {
        router.set(url);
      } else {
        router.set(url, true);
      }
    }
    return (
      <button key="returnToTournament" oncreate={helper.ontap(handler)}>
        <span className="fa fa-trophy" />
        {i18n('backToTournament')}
      </button>
    );
  },
  withdrawFromTournament: function(ctrl: OnlineRound) {
    function handler() {
      ctrl.hideActions();
      tournamentXhr.withdraw(ctrl.data.game.tournamentId);
      router.set('/tournament/' + ctrl.data.game.tournamentId, true);
    }
    return (
      <button key="withdrawFromTournament" oncreate={helper.ontap(handler)}>
        <span className="fa fa-flag" />
        {i18n('withdraw')}
      </button>
    );
  },
  goBerserk: function(ctrl: OnlineRound) {
    if (!gameApi.berserkableBy(ctrl.data)) return null;
    if (ctrl.vm.goneBerserk[ctrl.data.player.color]) return null;
    function handler() {
      ctrl.hideActions();
      ctrl.goBerserk();
    }
    return (
      <button className="berserk" key="goBerserk" oncreate={helper.ontap(handler)}>
        <span data-icon="`" /> GO BERSERK!<br/>
        <small>Half the time, bonus point</small>
      </button>
    );
  }
};
