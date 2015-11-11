import chessground from 'chessground';
import { computeFen, castlesAt, validateFen, readColorFromFen, readCastlesFromFen, readEnPassantFromFen } from './editor';
import menu from './menu';
import m from 'mithril';
import { loadJsonFile } from '../../utils';
import continuePopup from './continuePopup';
import i18n from '../../i18n';

export default function controller() {

  const startingFen = m.route.param('fen') || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

  if (!validateFen(startingFen).valid) {
    console.log(validateFen(startingFen));
    window.plugins.toast.show('Invalid fen string', 'short', 'center');
    m.route('/');
  }

  this.data = {
    game: {
      variant: {
        key: 'editor'
      }
    }
  };

  this.castles = readCastlesFromFen(startingFen);
  this.color = m.prop(readColorFromFen(startingFen));
  this.enpassant = m.prop(readEnPassantFromFen(startingFen));

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
    fen: startingFen,
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
        // we don't support enpassant field when setting position manually
        this.enpassant('-');
      }
    },
    disableContextMenu: true
  });

  this.computeFen = computeFen.bind(undefined, this.castles, this.color, this.enpassant, this.chessground.getFen);

  this.menu = menu.controller(this);
  this.continuePopup = continuePopup.controller();

  this.startPosition = function() {
    this.chessground.set({
      fen: 'start'
    });
    this.castles = castlesAt(true);
    this.color('w');
  }.bind(this);

  this.clearBoard = function() {
    this.chessground.set({
      fen: '8/8/8/8/8/8/8/8'
    });
    this.castles = castlesAt(false);
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
