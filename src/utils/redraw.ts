import signals from '../signals'
import { batchRequestAnimationFrame } from './batchRAF'

export const redrawSync = signals.redraw.dispatch

export default function redraw() {
  // console.trace()
  batchRequestAnimationFrame(redrawSync)
}
