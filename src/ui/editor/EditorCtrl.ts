import { Plugins } from '@capacitor/core'
import debounce from 'lodash-es/debounce'
import Chessground from '../../chessground/Chessground'
import * as cgDrag from '../../chessground/drag'
import * as chess from '../../chess'
import router from '../../router'
import { loadLocalJsonFile, prop, Prop } from '../../utils'
import redraw from '../../utils/redraw'
import settings from '../../settings'
import menu from './menu'
import pasteFenPopup from './pasteFenPopup'
import { validateFen } from '../../utils/fen'
import continuePopup, { Controller as ContinuePopupCtrl } from '../shared/continuePopup'
import i18n from '../../i18n'
import drag from './drag'

const startingFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'

interface EditorData {
  color: Prop<Color>
  castles: {
    K: Prop<boolean>
    Q: Prop<boolean>
    k: Prop<boolean>
    q: Prop<boolean>
    [k: string]: Prop<boolean>
  }
  enpassant: Prop<string>
  halfmove: Prop<string>
  moves: Prop<string>
}

interface Data {
  editor: EditorData
  game: {
    variant: {
      key: VariantKey
    }
  }
  playable: boolean
}

export interface MenuInterface {
  open: () => void
  close: () => void
  isOpen: () => boolean
  root: EditorCtrl
}

export default class EditorCtrl {
  public data: Data
  public menu: MenuInterface
  public pasteFenPopup: MenuInterface
  public continuePopup: ContinuePopupCtrl
  public chessground: Chessground

  public positions: Prop<Array<BoardPosition>>
  public endgamesPositions: Prop<Array<BoardPosition>>
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
      },
      playable: true,
    }

    this.setPlayable(initFen).then(redraw)

    this.positions = prop<BoardPosition[]>([])
    this.endgamesPositions = prop<BoardPosition[]>([])

    this.extraPositions = [{
      fen: startingFen,
      name: i18n('startPosition'),
      eco: '',
    }, {
      fen: '8/8/8/8/8/8/8/8 w - - 0 1',
      name: i18n('clearBoard'),
      eco: '',
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
          this.updatePosition()
        }
      }
    })
  }

  private setPlayable = (fen: string): Promise<void> => {
    return chess.situation({ variant: 'standard', fen })
    .then(({ situation }) => {
      this.data.playable = situation.playable
    })
  }

  private updatePosition = debounce(() => {
    const newFen = this.computeFen()
    if (validateFen(newFen)) {
      const path = `/editor/${encodeURIComponent(newFen)}`
      try {
        window.history.replaceState(window.history.state, '', '?=' + path)
      } catch (e) { console.error(e) }
      this.setPlayable(newFen).then(redraw)
    }
  }, 250)

  public onstart = (e: TouchEvent) => drag(this, e)
  public onmove = (e: TouchEvent) => cgDrag.move(this.chessground, e)
  public onend = (e: TouchEvent) => cgDrag.end(this.chessground, e)

  public editorOnCreate = (vn: Mithril.VnodeDOM<any, any>) => {
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

  public setColor = (color: Color) => {
    this.data.editor.color(color)
    this.updatePosition()
  }

  public computeFen = () =>
    this.chessground.getFen() + ' ' + this.fenMetadatas()

  public loadNewFen = (newFen: string) => {
    if (validateFen(newFen))
      router.set(`/editor/${encodeURIComponent(newFen)}`, true)
    else
      Plugins.LiToast.show({ text: i18n('invalidFen'), duration: 'short' })
  }

  public goToAnalyse = () => {
    const fen = this.computeFen()
    chess.situation({ variant: 'standard', fen })
    .then(({ situation }) => {
      if (situation.playable) {
        router.set(`/analyse/fen/${encodeURIComponent(fen)}`)
      } else {
        Plugins.LiToast.show({ text: i18n('invalidFen'), duration: 'short' })
      }
    })
  }

  public continueFromHere = () => {
    const fen = this.computeFen()
    chess.situation({ variant: 'standard', fen })
    .then(({ situation }) => {
      if (situation.playable) {
        this.continuePopup.open(fen, 'standard')
      } else {
        Plugins.LiToast.show({ text: i18n('invalidFen'), duration: 'short' })
      }
    })
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
      color: prop(parts[1] as Color),
      castles: {
        K: prop(parts[2].includes('K')),
        Q: prop(parts[2].includes('Q')),
        k: prop(parts[2].includes('k')),
        q: prop(parts[2].includes('q'))
      },
      enpassant: prop(parts[3]),
      halfmove: prop(parts[4]),
      moves: prop(parts[5])
    }
  }
}
