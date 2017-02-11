import router from '../../router';
import session from '../../session';
import loginModal from '../loginModal';
import spinner from '../../spinner';
import challengesApi from '../../lichess/challenges';
import * as helper from '../helper';
import popupWidget from '../shared/popup';
import i18n from '../../i18n';
import * as h from 'mithril/hyperscript';
import { Challenge, ChallengeUser } from '../../lichess/interfaces/challenge';
import { ChallengeState } from './interfaces';

function publicUrl(challenge: Challenge) {
  return 'https://lichess.org/' + challenge.id;
}

function gameInfos(challenge: Challenge) {
  const mode = challenge.rated ? i18n('rated') : i18n('casual');
  const time = challengesApi.challengeTime(challenge);
  return (
    <div className="gameInfos">
      <span data-icon="p">{time}</span> • <span>{challenge.variant.name}</span> • <span>{mode}</span>
    </div>
  );
}

export function joinPopup(ctrl: ChallengeState): () => Mithril.Children {
  const challenge = ctrl.challenge();
  let joinDom: Mithril.BaseNode;
  if (challenge.rated && !session.isConnected()) {
    joinDom = h('div.error', [
      i18n('thisGameIsRated'), h('br'), h('br'), i18n('mustSignInToJoin'),
      h('div.go_or_cancel', [
        h('button.binary_choice[data-icon=E].withIcon', {
          oncreate: helper.ontap(loginModal.open)
        }, i18n('signIn')),
        h('button.binary_choice[data-icon=L].withIcon', {
          oncreate: helper.ontap(router.backHistory)
        }, i18n('cancel'))
      ])
    ]);
  } else if (session.isConnected()) {
    joinDom = h('div.go_or_cancel', [
      h('button.binary_choice[data-icon=E].withIcon', {
          oncreate: helper.ontap(ctrl.joinChallenge)
      }, i18n('join')),
      h('button.binary_choice[data-icon=L].withIcon', {
        oncreate: helper.ontap(ctrl.declineChallenge)
      }, i18n('decline'))
    ]);
  } else {
    joinDom = h('div', [
      h('button[data-icon=E].withIcon', {
          oncreate: helper.ontap(ctrl.joinChallenge)
      }, i18n('join'))
    ]);
  }

  return function() {
    const challenger = challenge.challenger ?
      i18n('playerisInvitingYou', challengeUserFormat(challenge.challenger)) :
      i18n('playerisInvitingYou', 'Anonymous');

    return popupWidget(
      'join_url_challenge',
      null,
      function() {
        return h('div.infos', [
          h('div.challenger', challenger),
          h('br'),
          gameInfos(challenge),
          h('br'),
          joinDom
        ]);
      },
      true
    );
  };
}

export function awaitInvitePopup(ctrl: ChallengeState) {
  const challenge = ctrl.challenge();

  const isPersistent = challengesApi.isPersistent(challenge);

  return function() {
    return popupWidget(
      'await_url_challenge',
      null,
      function() {
        return h('div.infos', [
          gameInfos(challenge),
          h('br'),
          h('p.explanation', i18n('toInviteSomeoneToPlayGiveThisUrl')),
          h('input.lichess_game_url', {
            value: publicUrl(challenge),
            readonly: true
          }),
          h('p.explanation.small', i18n('theFirstPersonToComeOnThisUrlWillPlayWithYou')),
          h('div.go_or_cancel.clearfix', [
            h('button.binary_choice[data-icon=E].withIcon', {
              oncreate: helper.ontap(function() {
                window.plugins.socialsharing.share(null, null, null, publicUrl(challenge));
              })
            }, i18n('shareGameURL')),
            h('button.binary_choice[data-icon=L].withIcon', {
              oncreate: helper.ontap(ctrl.cancelChallenge)
            }, i18n('cancel'))
          ]),
          isPersistent ? h('div', [
            h('br'),
            h('button', {
              oncreate: helper.ontap(() => router.set('/'))
            }, [h('span.fa.fa-home'), i18n('returnToHome')])
          ]) : null
        ]);
      },
      true
    );
  };
}

function challengeUserFormat(user: ChallengeUser) {
  const ratingString = user.rating + (user.provisional ? '?' : '');
  return `${user.id} (${ratingString})`;
}

export function awaitChallengePopup(ctrl: ChallengeState) {

  const challenge = ctrl.challenge();

  function popupContent() {
    return (
      <div className="infos">
        <div>{i18n('waitingForOpponent')}</div>
        <br />
        <div className="user">{challengeUserFormat(challenge.destUser)}</div>
        {gameInfos(challenge)}
        <br />
        {spinner.getVdom()}
        <br />
        <br />
        <button className="withIcon" data-icon="L" oncreate={helper.ontap(ctrl.cancelChallenge)}>
          {i18n('cancel')}
        </button>
      </div>
    );
  }

  return function() {
    return popupWidget('await_url_challenge', null, popupContent, true);
  };
}
