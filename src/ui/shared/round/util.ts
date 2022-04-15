import { OnlineGameData, GameStep, CheckCount } from '../../../lichess/interfaces/game'
import { batchRequestAnimationFrame } from '../../../utils/batchRAF'
import * as helper from '../../helper'
import { RoundInterface } from '.'

export function firstPly(d: OnlineGameData): number {
  return d.steps[0].ply
}

export function lastPly(d: OnlineGameData): number {
  return d.steps[d.steps.length - 1].ply
}

export function plyStep(d: OnlineGameData, ply: number): GameStep {
  return d.steps[ply - firstPly(d)]
}

export function autoScroll(movelist?: HTMLElement) {
  if (!movelist) return
  batchRequestAnimationFrame(() => {
    const plyEl = movelist.querySelector('.current') as HTMLElement
    if (plyEl) movelist.scrollTop = plyEl.offsetTop - movelist.offsetHeight / 2 + plyEl.offsetHeight / 2
  })
}

export function autoScrollInline(movelist?: HTMLElement) {
  if (!movelist) return
  batchRequestAnimationFrame(() => {
    const plyEl = movelist.querySelector('.current') as HTMLElement
    if (plyEl) movelist.scrollLeft = plyEl.offsetLeft - movelist.offsetWidth / 2 + plyEl.offsetWidth / 2
  })
}

export function getMoveEl(e: Event) {
  const target = (e.target as HTMLElement)
  return target.tagName === 'MOVE' ? target :
    helper.findParentBySelector(target, 'move')
}

export function onReplayTap(ctrl: RoundInterface, e: Event) {
  const el = getMoveEl(e)
  if (el && el.dataset.ply) {
    ctrl.jump(Number(el.dataset.ply))
  }
}

export const NO_CHECKS: CheckCount = {
  white: 0,
  black: 0,
}
interface CheckState {
  ply: number
  check?: boolean | Key
}
export function countChecks(steps: CheckState[], ply: Ply): CheckCount {
  const checks: CheckCount = { ...NO_CHECKS }
  for (const step of steps) {
    if (ply < step.ply) break
    if (step.check) {
      if (step.ply % 2 === 1) checks.white++
      else checks.black++
    }
  }
  return checks
}
