import * as utils from '../../utils';
import helper from '../helper';
import layout from '../layout';
import { header as headerWidget } from '../shared/common';
import i18n from '../../i18n';
import session from '../../session';
import loginModal from '../loginModal';
import newGameForm from '../newGameForm';
import tabs from '../shared/tabs';
import m from 'mithril';

export default function view(ctrl) {
  const header = utils.partialf(headerWidget, i18n('correspondence'));

  return layout.free(header, renderBody.bind(undefined, ctrl), renderFooter);
}

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

function renderBody(ctrl) {
  if (!session.isConnected()) {
    return [
      m('div.seeks.disconnected', [
        m('div.seeks_background'),
        m('div.seeks_scroller', [
          m('div.vertical_align.must_signin', i18n('mustSignIn'))
        ]),
        m('button.fat', {
          key: 'seeks_login',
          config: helper.ontouch(loginModal.open)
        }, i18n('logIn'))
      ])
    ];
  }

  const tabsBar = m.component(tabs, {
    buttons: tabButtons,
    selectedTab: ctrl.selectedTab(),
    onTabChange: k => {
      const loc = window.location.search.replace(/\?tab\=\w+$/, '');
      window.history.replaceState(null, null, loc + '?tab=' + k);
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

function renderFooter() {
  return m('div.correpondenceFooter', m('button#newGameCorres', {
    key: 'seeks_createagame',
    config: helper.ontouch(newGameForm.openCorrespondence)
  }, [m('span.fa.fa-plus-circle'), i18n('createAGame')]));
}

function renderChallenges(ctrl) {
  return ctrl.sendingChallenges().length ?
    m('ul', ctrl.sendingChallenges().map(utils.partialf(renderChallenge, ctrl))) :
    m('div.vertical_align.empty_seeks_list', 'Oops! Nothing here.');
}

function renderPool(ctrl) {
  return ctrl.getPool().length ?
    m('ul', ctrl.getPool().map(utils.partialf(renderSeek, ctrl))) :
    m('div.vertical_align.empty_seeks_list', 'Oops! Nothing here.');
}

function renderChallenge(ctrl, c) {
  const playerName = c.destUser && utils.lightPlayerName(c.destUser);
  return (
    <li id={c.id} key={'challenge' + c.id} className="list_item sendingChallenge"
      config={helper.ontouchY(
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
          {utils.challengeTime(c)}, {i18n(c.mode === 1 ? 'rated' : 'casual')}
        </div>
      </div>
    </li>
  );
}

function renderSeek(ctrl, seek) {
  var action = seek.username.toLowerCase() === session.getUserId() ? 'cancel' : 'join';
  return m('li', {
    key: 'seek' + seek.id,
    'id': seek.id,
    className: 'list_item seek ' + action,
    config: helper.ontouchY(utils.partialf(ctrl[action], seek.id))
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
