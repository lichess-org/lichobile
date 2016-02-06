import session from '../../session';
import loginModal from '../loginModal';
import layout from '../layout';
import * as utils from '../../utils';
import helper from '../helper';
import { viewOnlyBoardContent, header as headerWidget } from '../shared/common';
import popupWidget from '../shared/popup';
import i18n from '../../i18n';
import challengesApi from '../../lichess/challenges';
import m from 'mithril';

export default function view(ctrl) {
  var overlay;

  const header = utils.partialf(headerWidget, 'lichess.org');
  const board = viewOnlyBoardContent;
  const user = session.get();
  const challenge = ctrl.data().challenge;

  if (user) {
    if (challenge.destUser) {
      overlay = awaitChallengePopup(ctrl);
    } else {
      overlay = awaitInvitePopup(ctrl);
    }
  } else {
    // overlay = awaitInvitePopup(ctrl);
    overlay = joinPopup(ctrl);
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
      <p className="time small" data-icon="p">{challengesApi.time(challenge)}</p>
      <p className="mode small">{`${i18n('mode')}: ${mode}`}</p>
    </div>
  );
}

function joinPopup(ctrl) {
  var data = ctrl.getData();
  var opp = data.opponent.user;
  var joinDom;
  if (data.game.rated && !session.isConnected()) {
    joinDom = m('div.error', [
      i18n('thisGameIsRated'), m('br'), m('br'), i18n('mustSignInToJoin'),
      m('div.go_or_cancel', [
        m('button.binary_choice[data-icon=E]', {
          config: helper.ontouch(loginModal.open)
        }, i18n('signIn')),
        m('button.binary_choice[data-icon=L]', {
          config: helper.ontouch(utils.backHistory)
        }, i18n('cancel'))
      ])
    ]);
  } else {
    joinDom = m('div.go_or_cancel', [
      m('button.binary_choice[data-icon=E]', {
          config: helper.ontouch(utils.f(ctrl.joinChallenge, data.game.id))
      }, i18n('join')),
      m('button.binary_choice[data-icon=L]', {
        config: helper.ontouch(utils.backHistory)
      }, i18n('cancel'))
    ]);
  }

  return function() {
    return popupWidget(
      'join_url_challenge',
      () => opp ? opp.username : 'Anonymous',
      function() {
        return m('div.infos', [
          gameInfos(data),
          m('br'),
          joinDom
        ]);
      },
      true
    );
  };
}

function awaitInvitePopup(ctrl) {
  var challenge = ctrl.data().challenge;

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
            m('button.binary_choice[data-icon=E]', {
              config: helper.ontouch(function() {
                window.plugins.socialsharing.share(null, null, null, publicUrl(challenge));
              })
            }, i18n('shareGameURL')),
            m('button.binary_choice[data-icon=L]', {
              config: helper.ontouch(ctrl.cancelChallenge)
            }, i18n('cancel'))
          ]),
          m('br'),
          gameInfos(challenge)
        ]);
      },
      true
    );
  };
}

function awaitChallengePopup(ctrl) {

  function popupContent() {
    return (
      <div className="infos">
        <div className="user">{m.route.param('userId')}</div>
        <br />
        <div className="loader"><span data-icon="U" /></div>
        <br />
        <p>{i18n('waitingForOpponent')}</p>
        <button data-icon="L" config={helper.ontouch(ctrl.cancelChallenge)}>
          {i18n('cancel')}
        </button>
        <br />
        {gameInfos(ctrl.data().challenge)}
      </div>
    );
  }

  return function() {
    return popupWidget('await_url_challenge', () => i18n('challengeToPlay'), popupContent, true);
  };
}
