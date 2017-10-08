import * as h from 'mithril/hyperscript'
import * as range from 'lodash/range'
import i18n from '../../../i18n'
import * as helper from '../../helper'
import { isClientEval } from '../../shared/tree/interfaces'

import AnalyseCtrl from '../AnalyseCtrl'
import { renderEval } from '../util'
import pv2san from './pv2san'

export default function renderCeval(ctrl: AnalyseCtrl) {
  if (!ctrl.ceval.enabled()) return h('div.ceval-notEnabled', 'Computer eval is disabled')

  return h('div.ceval-Wrapper', [
    renderCevalInfos(ctrl),
    renderCevalPvs(ctrl)
  ])
}

function renderCevalInfos(ctrl: AnalyseCtrl) {
  const node = ctrl.node
  const ceval = node.ceval
  const maxDepth = ctrl.ceval.maxDepth
  const isInfinite = ctrl.settings.s.cevalInfinite

  if (!ceval) return null

  return h('div.analyse-fixedBar.ceval-infos', [
    h('div.depth', [h('strong', 'Depth: '), ceval.depth + (isInfinite ? '' : `/${maxDepth}`)]),
    h('div.knps', [h('strong', 'kn/s: '), Math.round(ceval.knps)]),
    h('div.nodes', [h('strong', 'nodes: '), Math.round(ceval.nodes / 1000) + 'k']),
    h('div.time', [h('strong', 'time: '), formatTime(ceval.millis)])
  ])
}

function formatTime(millis: number) {
  const s = Math.round(millis / 1000)
  if (s < 60) {
    return s + 's'
  }
  else {
    const min = Math.round(s / 60)
    const rs = s % 60
    return `${min}min ${rs}s`
  }
}

function onLineTap(ctrl: AnalyseCtrl, e: Event) {
  const el = helper.getLI(e)
  const uci = el && el.dataset['uci']
  if (uci) ctrl.uciMove(uci)
}

function renderCevalPvs(ctrl: AnalyseCtrl) {
  const multiPv = ctrl.ceval.opts.multiPv
  const node = ctrl.node
  if (node.ceval && !ctrl.gameOver()) {
    const pvs = node.ceval.pvs
    return h('ul.ceval-pv_box.native_scroller', {
      oncreate: helper.ontapXY(e => onLineTap(ctrl, e), undefined, helper.getLI)
    }, range(multiPv).map((i) => {
      if (!pvs[i]) return h('li.pv')
      const san = pv2san(ctrl.ceval.variant, node.fen, false, pvs[i].moves, pvs[i].mate)
      return h('li.ceval-pv', {
        'data-uci': pvs[i].moves[0],
        className: i % 2 ? 'even' : 'odd'
      }, [
        h('strong.ceval-pv_eval', pvs[i].mate !== undefined ? ('#' + pvs[i].mate) : renderEval(pvs[i].cp!)),
        h('div.ceval-pv-line', san)
      ])
    }))
  }
  else if (ctrl.gameOver()) {
    return h('div.ceval-pv_box.native_scroller.loading.gameOver', {
      key: 'ceval-gameover'
    }, [h('i.withIcon[data-icon=]'), i18n('gameOver')])
  }
  else {
    return h('div.ceval-pv_box.native_scroller.loading', {
      key: 'ceval-loading'
    }, spinnerPearl())
  }
}

export const EvalBox: Mithril.Component<{ ctrl: AnalyseCtrl }, {}> = {
  onbeforeupdate({ attrs }) {
    return !attrs.ctrl.replaying
  },
  view({ attrs }) {
    const { ctrl } = attrs
    const node = ctrl.node
    const { ceval } = node
    const fav = node.eval || ceval

    if (!ctrl.ceval.enabled() && !fav) return null

    let pearl: Mithril.Children

    if (fav && (!isClientEval(fav) || fav.depth >= ctrl.ceval.minDepth) && fav.cp !== undefined) {
      pearl = renderEval(fav.cp)
    }
    else if (fav && fav.mate !== undefined) {
      pearl = '#' + fav.mate
    }
    else if (ctrl.gameOver()) {
      pearl = '-'
    }
    else  {
      pearl = ctrl.replaying ? '' : spinnerPearl()
    }

    return (
      <div className="ceval-curEval">
        { pearl }
      </div>
    )
  }
}

function spinnerPearl() {
 return h('div.spinner.fa.fa-hourglass-half')
}
