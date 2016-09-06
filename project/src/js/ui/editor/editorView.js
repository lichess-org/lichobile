import layout from '../layout';
import router from '../../router';
import { header } from '../shared/common';
import Board from '../shared/Board';
import * as helper from '../helper';
import i18n from '../../i18n';
import menu, { renderSelectColorPosition, renderCastlingOptions } from './menu';
import continuePopup from '../shared/continuePopup';
import settings from '../../settings';
import * as m from 'mithril';

export default function view(vnode) {
  const ctrl = vnode.state;
  const color = ctrl.chessground.data.orientation;
  const opposite = color === 'white' ? 'black' : 'white';

  const board = m(Board, {
    data: ctrl.data,
    chessgroundCtrl: ctrl.chessground,
    bounds: null,
    isPortrait: helper.isPortrait()
  });

  function content() {
    if (helper.isPortrait())
      return m('div#boardEditor.editor', {
          className: settings.general.theme.piece(),
          oncreate: ctrl.editorOnCreate,
          onremove: ctrl.editorOnRemove
        }, [
          sparePieces(ctrl, opposite, color, 'top'),
          board,
          sparePieces(ctrl, color, color, 'bottom'),
          renderActionsBar(ctrl)
        ]);
    else
      return [
        m('div.editor', {
          className: settings.general.theme.piece(),
          oncreate: ctrl.editorOnCreate,
          onremove: ctrl.editorOnRemove
        }, [
          sparePieces(ctrl, opposite, color, 'top'),
          board,
          sparePieces(ctrl, color, color, 'bottom')
        ]),
        m('section.table.editorTable', { key: 'table' }, [
          m('div.editorMenuOuter', [
            m('div.editorMenuInner', [
              renderSelectColorPosition(ctrl),
              helper.isWideScreen() ? renderCastlingOptions(ctrl) : null
            ]),
            renderActionsBar(ctrl)
          ])
        ])
      ];
  }

  function overlay() {
    return [
      menu.view(ctrl.menu),
      continuePopup.view(ctrl.continuePopup)
    ];
  }

  return layout.board(
    header.bind(undefined, i18n('boardEditor')),
    content,
    overlay
  );
}

function sparePieces(ctrl, color, orientation, position) {
  return m('div', {
    className: ['sparePieces', position, 'orientation-' + orientation, color].join(' ')
  }, ['king', 'queen', 'rook', 'bishop', 'knight', 'pawn'].map(function(role) {
    return m('div.sparePieceWrapper', m('piece', {
      className: color + ' ' + role,
      'data-color': color,
      'data-role': role
    }));
  }));
}

function renderActionsBar(ctrl) {
  return m('section.actions_bar', [
    helper.isPortrait() || (helper.isLandscape() && !helper.isWideScreen()) ?
    m('button.action_bar_button.fa.fa-ellipsis-h', {
      key: 'editorMenu',
      oncreate: helper.ontap(ctrl.menu.open)
    }) : null,
    m('button.action_bar_button[data-icon=B]', {
      key: 'toggleOrientation',
      oncreate: helper.ontap(ctrl.chessground.toggleOrientation)
    }),
    m('button.action_bar_button[data-icon=U]', {
      key: 'continueFromHere',
      oncreate: helper.ontap(() => {
        ctrl.continuePopup.open(ctrl.computeFen());
      }, () => window.plugins.toast.show(i18n('continueFromHere'), 'short', 'center'))
    }),
    m('button.action_bar_button[data-icon=A]', {
      key: 'analyse',
      oncreate: helper.ontap(() => {
        const fen = encodeURIComponent(ctrl.computeFen());
        router.set(`/analyse/fen/${fen}`);
      }, () => window.plugins.toast.show(i18n('analysis'), 'short', 'center'))
    }),
    m('button.action_bar_button.fa.fa-share-alt', {
      key: 'sharePosition',
      oncreate: helper.ontap(
        () => window.plugins.socialsharing.share(ctrl.computeFen()),
        () => window.plugins.toast.show('Share FEN', 'short', 'bottom')
      )
    })
  ]);
}

