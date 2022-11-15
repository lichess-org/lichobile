import * as chessFormat from '../utils/chessFormat'
import { State } from '../chessground/state'
import fen from '../chessground/fen'
import bluetooth from './bluetooth'
import external from '../externalDevice'

export function isUserTurn(st: State): boolean {
    return st.otb || st.orientation === st.turnColor
}

export function fenTurnColor(st: State): string {
    return st.turnColor === 'white' ? 'w' : 'b'
}

export function genFullFen(st: State): string {
    return [fen.write(st.pieces), fenTurnColor(st)].join(' ')
}

export function lastMoveToUci(st: State): string {
    return chessFormat.moveToUci(
        st.lastMove![0],
        st.lastMove![1],
        st.lastPromotion ? st.lastPromotion : undefined)
}

export function sendMsgToDevice(msg: string) {
    bluetooth.sendMsgToDevice(msg)
}

export function sendMoveToBoard(uci: string) {
    const move = chessFormat.uciToMove(uci)
    const prom = chessFormat.uciToProm(uci)
    external.sendMoveToBoard(move[0], move[1], prom)
}

export function getCommandParams(msg: string): string {
    return msg.substring(msg.indexOf(' ') + 1)
}

export function delay(milliseconds : number) {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
}