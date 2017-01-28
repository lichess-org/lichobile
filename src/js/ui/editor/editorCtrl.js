import chessground from '../../chessground';
import router from '../../router';
import redraw from '../../utils/redraw';
import settings from '../../settings';
import { computeFen, readFen } from './editor';
import menu from './menu';
import { loadLocalJsonFile } from '../../utils';
import { batchRequestAnimationFrame } from '../../utils/batchRAF';
import continuePopup from '../shared/continuePopup';
import i18n from '../../i18n';
import socket from '../../socket';
import * as helper from '../helper';
import drag from './drag';
import * as stream from 'mithril/stream';

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

  this.positions = stream([]);
  this.endgamesPositions = stream([]);

  this.extraPositions = [{
    fen: startingFen,
    name: i18n('startPosition')
  }, {
    fen: '8/8/8/8/8/8/8/8 w - - 0 1',
    name: i18n('clearBoard')
  }];

  loadLocalJsonFile('data/positions.json')
  .then(data => {
    this.positions(data.reduce((acc, c) => acc.concat(c.positions), []));
    redraw();
  });

  loadLocalJsonFile('data/endgames.json')
  .then(data => {
    this.endgamesPositions(data);
    redraw();
  });

  this.chessground = new chessground.controller({
    batchRAF: batchRequestAnimationFrame,
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

  const onstart = drag.bind(undefined, this);
  const onmove = chessground.drag.move.bind(undefined, this.chessground.data);
  const onend = chessground.drag.end.bind(undefined, this.chessground.data);

  this.editorOnCreate = function(vn) {
    if (!vn.dom) return;
    const editorNode = document.getElementById('boardEditor');
    if (editorNode) {
      editorNode.addEventListener('touchstart', onstart);
      editorNode.addEventListener('touchmove', onmove);
      editorNode.addEventListener('touchend', onend);
    }
  };

  this.editorOnRemove = function() {
    const editorNode = document.getElementById('boardEditor');
    if (editorNode) {
      editorNode.removeEventListener('touchstart', onstart);
      editorNode.removeEventListener('touchmove', onmove);
      editorNode.removeEventListener('touchend', onend);
    }
  };

  this.computeFen = computeFen.bind(undefined, this.data.editor, this.chessground.getFen);

  this.menu = menu.controller(this);
  this.continuePopup = continuePopup.controller();

  this.loadNewFen = function(newFen) {
    router.set(`/editor/${encodeURIComponent(newFen)}`);
  };

}
