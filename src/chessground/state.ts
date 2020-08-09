import * as cg from './interfaces'
import { AnimCurrent } from './anim'
import { DragCurrent } from './drag'

export interface State {
  pieces: cg.Pieces
  orientation: Color // board orientation. white | black
  turnColor: Color // turn to play. white | black
  check: Key | null // square currently in check "a2"
  lastMove: KeyPair | null // squares part of the last move ["c3", "c4"]
  selected: Key | null // square currently selected "a1"
  coordinates: boolean // include coords attributes
  symmetricCoordinates: boolean // symmetric coords for otb
  autoCastle: boolean // immediately complete the castle by moving the rook after king move
  viewOnly: boolean // don't bind events: the user will never be able to move pieces around
  fixed: boolean // board is viewOnly and pieces won't move
  exploding: cg.Exploding | null
  otb: boolean // is this an otb game?
  otbMode: cg.OtbMode
  highlight: {
    lastMove: boolean // add last-move class to squares
    check: boolean // add check class to squares
  }
  animation: {
    enabled: boolean
    duration: number
    current: AnimCurrent | null
  }
  movable: {
    free: boolean // all moves are valid - board editor
    color: Color | 'both' | null // color that can move.
    dests: DestsMap | null // valid moves. {"a2" ["a3" "a4"] "b1" ["a3" "c3"]}
    showDests: boolean // whether to add the move-dest class on squares
    dropped: KeyPair | null // last dropped [orig, dest], not to be animated
    events: {
      after?: (orig: Key, dest: Key, metadata: cg.MoveMetadata) => void // called after the move has been played
      afterNewPiece?: (role: Role, key: Key, metadata: cg.MoveMetadata) => void // called after a new piece is dropped on the board
    }
    rookCastle?: boolean
  }
  premovable: {
    enabled: boolean // allow premoves for color that can not move
    showDests: boolean // whether to add the premove-dest class on squares
    castle: boolean // whether to allow king castle premoves
    current: KeyPair | null // keys of the current saved premove ["e2" "e4"]
    dests: readonly Key[] | null // premove destinations for the current selection
    events: {
      set?: (orig: Key, dest: Key, metadata?: cg.SetPremoveMetadata) => void // called after the premove has been set
      unset?: () => void // called after the premove has been unset
    }
  }
  predroppable: {
    enabled: boolean // allow predrops for color that can not move
    current: cg.Drop | null // current saved predrop {role: 'knight'; key: 'e4'}
    events: {
      set?: (role: Role, key: Key) => void // called after the predrop has been set
      unset?: () => void // called after the predrop has been unset
    }
  }
  draggable: {
    enabled: boolean // allow moves & premoves to use drag'n drop
    distance: number // minimum distance to initiate a drag; in pixels
    magnified: boolean // whether dragging piece is magnified
    centerPiece: boolean // when magnified, center the piece under finger (otherwise shifted up)
    preventDefault: boolean // whether to prevent default on move and end
    showGhost: boolean // show ghost of piece being dragged
    deleteOnDropOff: boolean // delete a piece when it is dropped off the board
    current: DragCurrent | null
  }
  selectable: {
    // disable to enforce dragging over click-click move
    enabled: boolean
  }
  events: {
    change?: () => void // called after the situation changes on the board
    // called after a piece has been moved.
    // capturedPiece is undefined or like {color: 'white'; 'role': 'queen'}
    move?: (orig: Key, dest: Key, capturedPiece?: Piece) => void
    dropNewPiece?: (piece: Piece, key: Key) => void
  }
  prev: cg.PrevData
}

export function makeDefaults(): State {
  return {
    pieces: new Map(),
    orientation: 'white' as Color,
    turnColor: 'white' as Color,
    check: null,
    lastMove: null,
    selected: null,
    coordinates: true,
    symmetricCoordinates: false,
    otb: false,
    otbMode: 'facing' as cg.OtbMode,
    autoCastle: true,
    viewOnly: false,
    fixed: false,
    exploding: null,
    highlight: {
      lastMove: true,
      check: true
    },
    animation: {
      enabled: true,
      duration: 200,
      current: null
    },
    movable: {
      free: true,
      color: 'both' as Color | 'both',
      dests: null,
      dropped: null,
      showDests: true,
      rookCastle: true,
      events: {}
    },
    premovable: {
      enabled: true,
      showDests: true,
      castle: true,
      dests: null,
      current: null,
      events: {}
    },
    predroppable: {
      enabled: false,
      current: null,
      events: {}
    },
    draggable: {
      enabled: true,
      distance: 3,
      magnified: true,
      centerPiece: false,
      preventDefault: true,
      showGhost: true,
      deleteOnDropOff: false,
      current: null
    },
    selectable: {
      enabled: true
    },
    events: {},
    prev: {
      orientation: null,
      bounds: null,
      turnColor: null,
      otbMode: null
    }
  }
}
