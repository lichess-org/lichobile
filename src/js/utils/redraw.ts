import signals from '../signals'
import { batchRequestAnimationFrame } from './batchRAF'

export default function() {
  batchRequestAnimationFrame(redrawSync)
}

export function redrawSync() {
  signals.redraw.dispatch()
}
