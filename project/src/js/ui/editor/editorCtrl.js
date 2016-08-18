import chessground from 'chessground-mobile';
import router from '../../router';
import settings from '../../settings';
import { computeFen, readFen } from './editor';
import menu from './menu';
import m from 'mithril';
import { loadJsonFile } from '../../utils';
import continuePopup from '../shared/continuePopup';
import i18n from '../../i18n';
import socket from '../../socket';
import helper from '../helper';

const startingFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

export default function oninit(vnode) {

  socket.createDefault();

  helper.analyticsTrackView('Board Editor');

  const initFen = vnode.attrs.fen || startingFen;

  this.data = {
    editor: readFen(initFen),
    game: {
      variant: {
        key: 'editorVariant'
      }
    }
  };

  this.positions = m.prop([]);

  this.extraPositions = [{
    fen: startingFen,
    name: i18n('startPosition')
  }, {
    fen: '8/8/8/8/8/8/8/8 w - - 0 1',
    name: i18n('clearBoard')
  }];

  loadJsonFile('data/positions.json')
  .then(data => {
    this.positions(data);
  })
  .catch(err => {
    // workaround for iOS: because xhr for local file has a 0 status it will
    // reject the promise and still have the response object
    if (err && err[0] && err[0].fen)
      this.positions(err);
  });

  this.chessground = new chessground.controller({
    fen: initFen,
    orientation: 'white',
    movable: {
      free: true,
      color: 'both',
      dropOff: 'trash'
    },
    highlight: {
      lastMove: false,
      check: false
    },
    animation: {
      duration: 300
    },
    premovable: {
      enabled: false
    },
    drawable: {
      enabled: false
    },
    draggable: {
      autoDistance: false,
      squareTarget: true,
      magnified: settings.game.magnified()
    },
    events: {
      change: () => {
        // we don't support enpassant, halfmove and moves fields when setting
        // position manually
        this.data.editor.enpassant('-');
        this.data.editor.halfmove('0');
        this.data.editor.moves('1');
      }
    },
    disableContextMenu: true
  });

  this.computeFen = computeFen.bind(undefined, this.data.editor, this.chessground.getFen);

  this.menu = menu.oninit(this);
  this.continuePopup = continuePopup.oninit();

  this.loadNewFen = function(newFen) {
    router.set(`/editor/${encodeURIComponent(newFen)}`);
  };

}
