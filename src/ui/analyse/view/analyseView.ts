import * as h from 'mithril/hyperscript'
import router from '../../../router'
import i18n from '../../../i18n'
import settings from '../../../settings'
import * as utils from '../../../utils'
import continuePopup from '../../shared/continuePopup'
import { view as renderPromotion } from '../../shared/offlineRound/promotion'
import ViewOnlyBoard from '../../shared/ViewOnlyBoard'
import { notesView } from '../../shared/round/notes'
import menu from '../menu'
import analyseSettings from '../analyseSettings'
import TabNavigation from '../../shared/TabNavigation'

import { Tab } from '../tabs'
import AnalyseCtrl from '../AnalyseCtrl'
import renderCeval, { EvalBox } from '../ceval/cevalView'
import renderExplorer, { getTitle as getExplorerTitle } from '../explorer/explorerView'
import renderCrazy from '../crazy/crazyView'
import { view as renderContextMenu } from '../contextMenu'
import TabView from './TabView'
import Replay from './Replay'
import Clocks from './clocks'
import retroView from '../retrospect/retroView'
import renderGameAnalysis from './gameAnalysis'
import renderBoard from './boardView'
import renderGameInfos from './gameInfosView'
import renderActionsBar from './actionsView'

export function renderContent(ctrl: AnalyseCtrl, isPortrait: boolean, bounds: ClientRect) {
  const availTabs = ctrl.availableTabs()

  return h.fragment({ key: isPortrait ? 'portrait' : 'landscape' }, [
    renderBoard(ctrl, bounds, availTabs),
    h('div.analyse-tableWrapper', [
      ctrl.data.game.variant.key === 'crazyhouse' ? renderCrazy(ctrl) : null,
      renderAnalyseTable(ctrl, availTabs, isPortrait),
      renderActionsBar(ctrl)
    ])
  ])
}

export function viewOnlyBoard(color: Color, bounds: ClientRect, isSmall: boolean, fen: string) {
  return h('section.board_wrapper', {
    className: isSmall ? 'halfsize' : ''
  }, h(ViewOnlyBoard, { orientation: color, bounds, fen }))
}

export function overlay(ctrl: AnalyseCtrl) {
  return [
    renderPromotion(ctrl),
    menu.view(ctrl.menu),
    analyseSettings.view(ctrl.settings),
    ctrl.notes ? notesView(ctrl.notes) : null,
    continuePopup.view(ctrl.continuePopup),
    renderContextMenu(ctrl)
  ]
}

export function renderVariantSelector(ctrl: AnalyseCtrl) {
  const variant = ctrl.data.game.variant.key
  const icon = utils.gameIcon(variant)
  let availVariants = settings.analyse.availableVariants
  if (variant === 'fromPosition') {
    availVariants = availVariants.concat([['From position', 'fromPosition']])
  }
  return (
    h('div.select_input.main_header-selector.header-subTitle', [
      h('label', {
        'for': 'variant_selector'
      }, h(`i[data-icon=${icon}]`)),
      h('select', {
        id: 'variant_selector',
        value: variant,
        onchange: (e: Event) => {
          const val = (e.target as HTMLSelectElement).value
          settings.analyse.syntheticVariant(val as VariantKey)
          router.set(`/analyse/variant/${val}`)
        }
      }, availVariants.map(v =>
        h('option', {
          key: v[1], value: v[1]
        }, v[0])
      ))
    ])
  )
}

function renderOpening(ctrl: AnalyseCtrl) {
  const opening = ctrl.tree.getOpening(ctrl.nodeList) || ctrl.data.game.opening
  if (opening) return h('div', {
    key: 'opening-title',
  }, [
    h('strong', opening.eco),
    ' ' + opening.name
  ])
}

function renderAnalyseTabs(ctrl: AnalyseCtrl, availTabs: Tab[]) {

  const curTab = ctrl.currentTab(availTabs)

  return h('div.analyse-header', [
    curTab.id !== 'ceval' ? h(EvalBox, { ctrl }) : null,
    h('div.analyse-tabs', [
      h('div.tab-title', renderTabTitle(ctrl, curTab)),
      h(TabNavigation, {
        buttons: availTabs,
        selectedIndex: ctrl.currentTabIndex(availTabs),
        onTabChange: ctrl.onTabChange
      })
    ])
  ])
}

function renderTabTitle(ctrl: AnalyseCtrl, curTab: Tab) {
  const curTitle = i18n(curTab.title)
  let children: Mithril.Children
  let key: string
  if (curTab.id === 'moves') {
    const op = renderOpening(ctrl)
    children = [op || curTitle]
    key = op ? 'opening' : curTab.id
  }
  else if (curTab.id === 'ceval') {
    children = [
      h('span', curTitle),
      ctrl.ceval.isSearching() ? h('div.ceval-spinner', 'analyzing ', h('span.fa.fa-spinner.fa-pulse')) : null
    ]
    key = ctrl.ceval.isSearching() ? 'searching-ceval' : curTab.id
  }
  else if (curTab.id === 'explorer') {
    children = [getExplorerTitle(ctrl)]
    key = curTab.id
  }
  else {
    children = [curTitle]
    key = curTab.id
  }

  return h.fragment({ key }, children)
}

function renderCheckCount(whitePov: boolean, checkCount: { white: number, black: number }) {
  const w = h('span.color-icon.white', '+' + checkCount.black)
  const b = h('span.color-icon.black', '+' + checkCount.white)
  return h('div.analyse-checkCount', whitePov ? [w, b] : [b, w])
}

function renderReplay(ctrl: AnalyseCtrl) {
  const checkCount = ctrl.node.checkCount
  const showFb = ctrl.node.clock || checkCount
  return h('div.analyse-replayWrapper', [
    showFb ? h('div.analyse-fixedBar', [
      h(Clocks, { ctrl }),
      checkCount ? renderCheckCount(ctrl.bottomColor() === 'white', checkCount) : null
    ]) : null,
    h(Replay, { ctrl })
  ])
}

const TabsContentRendererMap: { [id: string]: (ctrl: AnalyseCtrl) => Mithril.BaseNode } = {
  infos: renderGameInfos,
  moves: renderReplay,
  explorer: renderExplorer,
  analysis: renderGameAnalysis,
  ceval: renderCeval
}

function renderAnalyseTable(ctrl: AnalyseCtrl, availTabs: Tab[], isPortrait: boolean) {

  const tabsContent = availTabs.map(t =>
    TabsContentRendererMap[t.id](ctrl)
  )

  return h('div.analyse-table', {
    key: 'analyse'
  }, [
    renderAnalyseTabs(ctrl, availTabs),
    h(TabView, {
      className: 'analyse-tabsContent',
      selectedIndex: ctrl.currentTabIndex(availTabs),
      content: tabsContent,
      onTabChange: ctrl.onTabChange,
      isPortrait
    }),
    ctrl.retro ? retroView(ctrl) : null
  ])
}
