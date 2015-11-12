import chessground from 'chessground';
import { computeFen, castlesAt, validateFen, readFen } from './editor';
import menu from './menu';
import m from 'mithril';
import { loadJsonFile } from '../../utils';
import continuePopup from './continuePopup';
import i18n from '../../i18n';

const startingFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

export default function controller() {

  const initFen = m.route.param('fen') || startingFen;

  if (!validateFen(initFen).valid) {
    window.plugins.toast.show('Invalid fen string', 'short', 'center');
    m.route('/');
  }

  this.data = {
    editor: readFen(initFen),
    game: {
      variant: {
        key: 'editor'
      }
    }
  };

  this.positions = m.prop([]);

  this.extraPositions = [{
    fen: startingFen,
    name: i18n('startPosition')
  }, {
    fen: '8/8/8/8/8/8/8/8 w - -',
    name: i18n('clearBoard')
  }];

  loadJsonFile('data/positions.json').then(data => {
    this.positions(data);
    return data;
  }, err => {
    // workaround for iOS: because xhr for local file has a 0 status it will
    // reject the promise and still have the response object
    if (err && err[0] && err[0].fen)
      return err;
    else
      throw err;
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
      showGhost: false,
      autoDistance: false,
      squareTarget: true
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

  this.menu = menu.controller(this);
  this.continuePopup = continuePopup.controller();

  this.startPosition = function() {
    this.chessground.set({
      fen: 'start'
    });
    this.data.editor.castles = castlesAt(true);
    this.data.editor.color('w');
  }.bind(this);

  this.clearBoard = function() {
    this.chessground.set({
      fen: '8/8/8/8/8/8/8/8'
    });
    this.data.editor.castles = castlesAt(false);
  }.bind(this);

  this.loadNewFen = function(newFen) {
    m.redraw.strategy('diff');
    m.route(`/editor/${encodeURIComponent(newFen)}`);
  };

  this.positionLooksLegit = function() {
    var kings = {
      white: 0,
      black: 0
    };
    var pieces = this.chessground.data.pieces;
    for (var pos in pieces) {
      if (pieces[pos] && pieces[pos].role === 'king') kings[pieces[pos].color]++;
    }
    return kings.white === 1 && kings.black === 1;
  }.bind(this);
}
