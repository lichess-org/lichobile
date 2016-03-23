import session from '../../session';
import loginModal from '../loginModal';
import challengesApi from '../../lichess/challenges';
import layout from '../layout';
import * as utils from '../../utils';
import helper from '../helper';
import { viewOnlyBoardContent, header as headerWidget } from '../shared/common';
import popupWidget from '../shared/popup';
import i18n from '../../i18n';
import m from 'mithril';

export default function view(ctrl) {
  var overlay;

  const header = utils.partialf(headerWidget, 'lichess.org');
  const board = viewOnlyBoardContent;
  const challenge = ctrl.challenge();

  if (challenge) {
    if (challenge.direction === 'in') {
      overlay = joinPopup(ctrl);
    } else if (challenge.direction === 'out') {
      if (challenge.destUser) {
        overlay = awaitChallengePopup(ctrl);
      } else {
        overlay = awaitInvitePopup(ctrl);
      }
    }
  }

  return layout.board(header, board, overlay);
}

function publicUrl(challenge) {
  return 'http://lichess.org/' + challenge.id;
}

function gameInfos(challenge) {
  const mode = challenge.rated ? i18n('rated') : i18n('casual');
  return (
    <div className="gameInfos">
      <p className="explanation small">{`${i18n('variant')}: ${challenge.variant.name}`}</p>
      <p className="time small" data-icon="p">{utils.challengeTime(challenge)}</p>
      <p className="mode small">{`${i18n('mode')}: ${mode}`}</p>
    </div>
  );
}

function joinPopup(ctrl) {
  const challenge = ctrl.challenge();
  var joinDom;
  if (challenge.rated && !session.isConnected()) {
    joinDom = m('div.error', [
      i18n('thisGameIsRated'), m('br'), m('br'), i18n('mustSignInToJoin'),
      m('div.go_or_cancel', [
        m('button.binary_choice[data-icon=E].withIcon', {
          config: helper.ontouch(loginModal.open)
        }, i18n('signIn')),
        m('button.binary_choice[data-icon=L].withIcon', {
          config: helper.ontouch(utils.backHistory)
        }, i18n('cancel'))
      ])
    ]);
  } else {
    joinDom = m('div.go_or_cancel', [
      m('button.binary_choice[data-icon=E].withIcon', {
          config: helper.ontouch(ctrl.joinChallenge)
      }, i18n('join')),
      m('button.binary_choice[data-icon=L].withIcon', {
        config: helper.ontouch(ctrl.declineChallenge)
      }, i18n('decline'))
    ]);
  }

  return function() {
    return popupWidget(
      'join_url_challenge',
      () => challenge.challenger ?
        i18n('playerisInvitingYou', challenge.challenger.id) :
        i18n('playerisInvitingYou', 'Anonymous'),
      function() {
        return m('div.infos', [
          gameInfos(challenge),
          m('br'),
          joinDom
        ]);
      },
      true
    );
  };
}

function awaitInvitePopup(ctrl) {
  const challenge = ctrl.challenge();

  const isPersistent = challengesApi.isPersistent(challenge);

  return function() {
    return popupWidget(
      'await_url_challenge',
      null,
      function() {
        return m('div.infos', [
          m('p.explanation', i18n('toInviteSomeoneToPlayGiveThisUrl')),
          m('input.lichess_game_url', {
            value: publicUrl(challenge),
            readonly: true
          }),
          m('p.explanation.small', i18n('theFirstPersonToComeOnThisUrlWillPlayWithYou')),
          m('div.go_or_cancel.clearfix', [
            m('button.binary_choice[data-icon=E].withIcon', {
              config: helper.ontouch(function() {
                window.plugins.socialsharing.share(null, null, null, publicUrl(challenge));
              })
            }, i18n('shareGameURL')),
            m('button.binary_choice[data-icon=L].withIcon', {
              config: helper.ontouch(ctrl.cancelChallenge)
            }, i18n('cancel'))
          ]),
          m('br'),
          gameInfos(challenge),
          isPersistent ? m('div', [
            m('br'),
            m('button', {
              config: helper.ontouch(() => m.route('/'))
            }, [m('span.fa.fa-home'), i18n('returnToHome')])
          ]) : null
        ]);
      },
      true
    );
  };
}

function awaitChallengePopup(ctrl) {

  const challenge = ctrl.challenge();

  function popupContent() {
    return (
      <div className="infos">
        <div className="user">{challenge.destUser.id}</div>
        <br />
        <div className="loader"><span data-icon="U" /></div>
        <br />
        <p>{i18n('waitingForOpponent')}</p>
        <button className="withIcon" data-icon="L" config={helper.ontouch(ctrl.cancelChallenge)}>
          {i18n('cancel')}
        </button>
        <br />
        {gameInfos(challenge)}
      </div>
    );
  }

  return function() {
    return popupWidget('await_url_challenge', () => i18n('challengeToPlay'), popupContent, true);
  };
}
