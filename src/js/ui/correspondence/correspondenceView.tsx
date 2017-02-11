import * as utils from '../../utils';
import challengesApi from '../../lichess/challenges';
import * as helper from '../helper';
import i18n from '../../i18n';
import session from '../../session';
import loginModal from '../loginModal';
import newGameForm from '../newGameForm';
import tabs from '../shared/tabs';
import * as h from 'mithril/hyperscript';
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
      h('div.seeks.disconnected', [
        h('div.seeks_background'),
        h('div.seeks_scroller', [
          h('div.vertical_align.must_signin', i18n('mustSignIn'))
        ]),
        h('button.fat', {
          key: 'seeks_login',
          oncreate: helper.ontap(loginModal.open)
        }, i18n('logIn'))
      ])
    ];
  }

  const tabsBar = h(tabs, {
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
    h('div.tabs-nav-header', tabsBar, h('div.main_header_drop_shadow')),
    h('div.tab_content.native_scroller.seeks_scroller',
      ctrl.selectedTab() === 'public' ?
        renderPool(ctrl) :
        renderChallenges(ctrl)
    )
  ];
}

export function renderFooter() {
  return h('div.correpondenceFooter', h('button#newGameCorres', {
    key: 'seeks_createagame',
    oncreate: helper.ontap(newGameForm.openCorrespondence)
  }, [h('span.fa.fa-plus-circle'), i18n('createAGame')]));
}

function renderChallenges(ctrl: State) {
  return ctrl.sendingChallenges().length ?
    h('ul', ctrl.sendingChallenges().map(c => renderChallenge(ctrl, c))) :
    h('div.vertical_align.empty_seeks_list', 'Oops! Nothing here.');
}

function renderPool(ctrl: State) {
  return ctrl.getPool().length ?
    h('ul', ctrl.getPool().map(s => renderSeek(ctrl, s))) :
    h('div.vertical_align.empty_seeks_list', 'Oops! Nothing here.');
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
  return h('li', {
    key: 'seek' + seek.id,
    'id': seek.id,
    className: 'list_item seek ' + action,
    oncreate: helper.ontapY(() => ctrl[action](seek.id))
  }, [
    h('div.icon', {
      'data-icon': seek.perf.icon
    }),
    h('div.body', [
      h('div.player', seek.username + ' (' + seek.rating + ')'),
      h('div.variant', seek.variant.name),
      h('div.time', [
        seek.days ? i18n(seek.days === 1 ? 'oneDay' : 'nbDays', seek.days) : '∞',
        ', ',
        i18n(seek.mode === 1 ? 'rated' : 'casual')
      ])
    ])
  ]);
}
