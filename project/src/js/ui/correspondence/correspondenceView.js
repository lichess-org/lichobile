import * as utils from '../../utils';
import helper from '../helper';
import layout from '../layout';
import { header as headerWidget, empty } from '../shared/common';
import i18n from '../../i18n';
import session from '../../session';
import loginModal from '../loginModal';
import newGameForm from '../newGameForm';
import m from 'mithril';

export default function view(ctrl) {

  const header = utils.partialf(headerWidget, i18n('correspondence'));
  const body = function() {

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

    return [
      m('div.native_scroller.seeks_scroller', ctrl.getPool().length ?
        m('ul', ctrl.getPool().map(utils.partialf(renderSeek, ctrl))) :
        m('div.vertical_align.empty_seeks_list', 'Oops! Nothing here.')
      ),
      m('button#newGameCorres', {
        key: 'seeks_createagame',
        config: helper.ontouch(newGameForm.openCorrespondence)
      }, [m('span.fa.fa-plus-circle'), i18n('createAGame')])
    ];
  };

  return layout.free(header, body, empty);
}


function renderSeek(ctrl, seek) {
  var action = seek.username.toLowerCase() === session.getUserId() ? 'cancel' : 'join';
  return m('li', {
    key: seek.id,
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
