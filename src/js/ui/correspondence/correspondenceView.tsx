import * as utils from '../../utils';
import challengesApi from '../../lichess/challenges';
import * as helper from '../helper';
import i18n from '../../i18n';
import session from '../../session';
import loginModal from '../loginModal';
import newGameForm from '../newGameForm';
import tabs from '../shared/tabs';
import * as m from 'mithril';
import { Seek } from '../../lichess/interfaces';
import { Challenge } from '../../lichess/interfaces/challenge';

import { State } from '.'

const tabButtons = [
  {
    label: 'Public games',
    key: 'public'
  },
  {
    label: 'Challenges',
    key: 'challenges'
  }
];

export function renderBody(ctrl: State) {
  if (!session.isConnected()) {
    return [
      m('div.seeks.disconnected', [
        m('div.seeks_background'),
        m('div.seeks_scroller', [
          m('div.vertical_align.must_signin', i18n('mustSignIn'))
        ]),
        m('button.fat', {
          key: 'seeks_login',
          oncreate: helper.ontap(loginModal.open)
        }, i18n('logIn'))
      ])
    ];
  }

  const tabsBar = m(tabs, {
    buttons: tabButtons,
    selectedTab: ctrl.selectedTab(),
    onTabChange: (k: string) => {
      const loc = window.location.search.replace(/\?tab\=\w+$/, '');
      try {
        window.history.replaceState(window.history.state, null, loc + '?tab=' + k);
      } catch (e) { console.error(e) }
      ctrl.selectedTab(k);
    }
  });

  return [
    m('div.nav_header', tabsBar),
    m('div.tab_content.native_scroller.seeks_scroller',
      ctrl.selectedTab() === 'public' ?
        renderPool(ctrl) :
        renderChallenges(ctrl)
    )
  ];
}

export function renderFooter() {
  return m('div.correpondenceFooter', m('button#newGameCorres', {
    key: 'seeks_createagame',
    oncreate: helper.ontap(newGameForm.openCorrespondence)
  }, [m('span.fa.fa-plus-circle'), i18n('createAGame')]));
}

function renderChallenges(ctrl: State) {
  return ctrl.sendingChallenges().length ?
    m('ul', ctrl.sendingChallenges().map(c => renderChallenge(ctrl, c))) :
    m('div.vertical_align.empty_seeks_list', 'Oops! Nothing here.');
}

function renderPool(ctrl: State) {
  return ctrl.getPool().length ?
    m('ul', ctrl.getPool().map(s => renderSeek(ctrl, s))) :
    m('div.vertical_align.empty_seeks_list', 'Oops! Nothing here.');
}

function renderChallenge(ctrl: State, c: Challenge) {
  const playerName = c.destUser && utils.lightPlayerName(c.destUser);
  return (
    <li id={c.id} key={'challenge' + c.id} className="list_item sendingChallenge"
      oncreate={helper.ontapY(
        helper.fadesOut(ctrl.cancelChallenge.bind(undefined, c.id), '.sendingChallenge', 300)
      )}
    >
      <div className="icon" data-icon={c.perf.icon} />
      <div className="body">
        <div className="player">
          {playerName ? i18n('youAreChallenging', playerName) : 'Open challenge'}
        </div>
        <div className="variant">
          {c.variant.name}
        </div>
        <div className="time">
          {challengesApi.challengeTime(c)}, {i18n(c.rated ? 'rated' : 'casual')}
        </div>
      </div>
    </li>
  );
}

function renderSeek(ctrl: State, seek: Seek) {
  const action = seek.username.toLowerCase() === session.getUserId() ? 'cancel' : 'join';
  return m('li', {
    key: 'seek' + seek.id,
    'id': seek.id,
    className: 'list_item seek ' + action,
    oncreate: helper.ontapY(() => ctrl[action](seek.id))
  }, [
    m('div.icon', {
      'data-icon': seek.perf.icon
    }),
    m('div.body', [
      m('div.player', seek.username + ' (' + seek.rating + ')'),
      m('div.variant', seek.variant.name),
      m('div.time', [
        seek.days ? i18n(seek.days === 1 ? 'oneDay' : 'nbDays', seek.days) : '∞',
        ', ',
        i18n(seek.mode === 1 ? 'rated' : 'casual')
      ])
    ])
  ]);
}
