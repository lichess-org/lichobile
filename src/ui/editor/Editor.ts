import * as debounce from 'lodash/debounce'
import Chessground from '../../chessground/Chessground'
import * as cgDrag from '../../chessground/drag'
import router from '../../router'
import redraw from '../../utils/redraw'
import settings from '../../settings'
import menu from './menu'
import pasteFenPopup from './pasteFenPopup'
import { validateFen } from '../../utils/fen'
import { loadLocalJsonFile } from '../../utils'
import { batchRequestAnimationFrame } from '../../utils/batchRAF'
import continuePopup, { Controller as ContinuePopupCtrl } from '../shared/continuePopup'
import i18n from '../../i18n'
import drag from './drag'
import * as stream from 'mithril/stream'

const startingFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'

interface EditorData {
  color: Mithril.Stream<Color>
  castles: {
    K: Mithril.Stream<boolean>
    Q: Mithril.Stream<boolean>
    k: Mithril.Stream<boolean>
    q: Mithril.Stream<boolean>
    [k: string]: Mithril.Stream<boolean>
  }
  enpassant: Mithril.Stream<string>
  halfmove: Mithril.Stream<string>
  moves: Mithril.Stream<string>
}

interface Data {
  editor: EditorData
  game: {
    variant: {
      key: VariantKey
    }
  }
}

export interface MenuInterface {
  open: () => void
  close: () => void
  isOpen: () => boolean
  root: Editor
}

export default class Editor {
  public data: Data
  public menu: MenuInterface
  public pasteFenPopup: MenuInterface
  public continuePopup: ContinuePopupCtrl
  public chessground: Chessground

  public positions: Mithril.Stream<Array<BoardPosition>>
  public endgamesPositions: Mithril.Stream<Array<BoardPosition>>
  public extraPositions: Array<BoardPosition>

  public constructor(fen?: string) {
    const initFen = fen || startingFen

    this.menu = menu.controller(this)
    this.pasteFenPopup = pasteFenPopup.controller(this)
    this.continuePopup = continuePopup.controller()

    this.data = {
      editor: this.readFen(initFen),
      game: {
        variant: {
          key: 'standard'
        }
      }
    }

    this.positions = stream([])
    this.endgamesPositions = stream([])

    this.extraPositions = [{
      fen: startingFen,
      name: i18n('startPosition')
    }, {
      fen: '8/8/8/8/8/8/8/8 w - - 0 1',
      name: i18n('clearBoard')
    }]

    Promise.all([
      loadLocalJsonFile<Array<BoardPositionCategory>>('data/positions.json'),
      loadLocalJsonFile<Array<BoardPosition>>('data/endgames.json')
    ])
    .then(([openings, endgames]) => {
      this.positions(
        openings.reduce((acc: Array<BoardPosition>, c: BoardPositionCategory) =>
          acc.concat(c.positions), [])
      )
      this.endgamesPositions(endgames)
      redraw()
    })

    this.chessground = new Chessground({
      batchRAF: batchRequestAnimationFrame,
      fen: initFen,
      orientation: 'white',
      movable: {
        free: true,
        color: 'both'
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
      draggable: {
        magnified: settings.game.magnified(),
        deleteOnDropOff: true
      },
      events: {
        change: () => {
          // we don't support enpassant, halfmove and moves fields when setting
          // position manually
          this.data.editor.enpassant('-')
          this.data.editor.halfmove('0')
          this.data.editor.moves('1')
          this.updateHref()
        }
      }
    })
  }

  private updateHref = debounce(() => {
    const newFen = this.computeFen()
    if (validateFen(newFen)) {
      const path = `/editor/${encodeURIComponent(newFen)}`
      try {
        window.history.replaceState(window.history.state, '', '?=' + path)
      } catch (e) { console.error(e) }
    }
  }, 250)

  public onstart = (e: TouchEvent) => drag(this, e)
  public onmove = (e: TouchEvent) => cgDrag.move(this.chessground, e)
  public onend = (e: TouchEvent) => cgDrag.end(this.chessground, e)

  public editorOnCreate = (vn: Mithril.DOMNode) => {
    if (!vn.dom) return
    const editorNode = document.getElementById('boardEditor')
    if (editorNode) {
      editorNode.addEventListener('touchstart', this.onstart)
      editorNode.addEventListener('touchmove', this.onmove)
      editorNode.addEventListener('touchend', this.onend)
    }
  }

  public editorOnRemove = () => {
    const editorNode = document.getElementById('boardEditor')
    if (editorNode) {
      editorNode.removeEventListener('touchstart', this.onstart)
      editorNode.removeEventListener('touchmove', this.onmove)
      editorNode.removeEventListener('touchend', this.onend)
    }
  }

  public computeFen = () =>
    this.chessground.getFen() + ' ' + this.fenMetadatas()

  public loadNewFen = (newFen: string) => {
    if (validateFen(newFen))
      router.set(`/editor/${encodeURIComponent(newFen)}`, true)
    else
      window.plugins.toast.show('Invalid FEN', 'short', 'center')
  }

  private fenMetadatas() {
    const data = this.data.editor
    let castlesStr = ''
    Object.keys(data.castles).forEach(function(piece) {
      if (data.castles[piece]()) castlesStr += piece
    })
    return data.color() + ' ' + (castlesStr.length ? castlesStr : '-') + ' ' + data.enpassant() + ' ' + data.halfmove() + ' ' + data.moves()
  }

  private readFen(fen: string): EditorData {
    const parts = fen.split(' ')
    return {
      color: stream(parts[1] as Color),
      castles: {
        K: stream(parts[2].includes('K')),
        Q: stream(parts[2].includes('Q')),
        k: stream(parts[2].includes('k')),
        q: stream(parts[2].includes('q'))
      },
      enpassant: stream(parts[3]),
      halfmove: stream(parts[4]),
      moves: stream(parts[5])
    }
  }
}
