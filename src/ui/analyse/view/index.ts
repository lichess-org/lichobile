import * as h from 'mithril/hyperscript'
import router from '../../../router'
import i18n from '../../../i18n'
import settings from '../../../settings'
import * as utils from '../../../utils'
import { emptyFen } from '../../../utils/fen'
import continuePopup from '../../shared/continuePopup'
import spinner from '../../../spinner'
import { view as renderPromotion } from '../../shared/offlineRound/promotion'
import ViewOnlyBoard from '../../shared/ViewOnlyBoard'
import { notesView } from '../../shared/round/notes'
import { Bounds } from '../../shared/Board'
import TabNavigation from '../../shared/TabNavigation'
import TabView from '../../shared/TabView'
import { loadingBackbutton } from '../../shared/common'
import * as helper from '../../helper'
import layout from '../../layout'
import { chatView } from '../../shared/chat'

import menu from '../menu'
import studyActionMenu from '../study/actionMenu'
import { renderReadonlyComments, renderPgnTags } from '../study/view'
import analyseSettings from '../analyseSettings'
import { Tab } from '../tabs'
import AnalyseCtrl from '../AnalyseCtrl'
import renderCeval, { EvalBox } from '../ceval/cevalView'
import renderExplorer, { getTitle as getExplorerTitle } from '../explorer/explorerView'
import renderCrazy from '../crazy/crazyView'
import { view as renderContextMenu } from '../contextMenu'
import Replay from './Replay'
import retroView from '../retrospect/retroView'
import renderAnalysis from './analysisView'
import renderBoard from './boardView'
import renderGameInfos from './gameInfosView'
import renderActionsBar from './actionsView'

export function loadingScreen(isPortrait: boolean, color?: Color, curFen?: string) {
  const isSmall = settings.analyse.smallBoard()
  const bounds = helper.getBoardBounds(helper.viewportDim(), isPortrait, isSmall)
  return layout.board(
    loadingBackbutton(),
    [
      viewOnlyBoard(color || 'white', bounds, isSmall, curFen || emptyFen),
      h('div.analyse-tableWrapper', spinner.getVdom('monochrome'))
    ]
  )
}

export function renderContent(ctrl: AnalyseCtrl, isPortrait: boolean, bounds: Bounds) {
  const availTabs = ctrl.availableTabs()

  return h.fragment({ key: isPortrait ? 'portrait' : 'landscape' }, [
    renderBoard(ctrl, bounds, availTabs),
    h('div.analyse-tableWrapper', [
      ctrl.data.game.variant.key === 'crazyhouse' ? renderCrazy(ctrl) : null,
      renderAnalyseTable(ctrl, availTabs),
      renderActionsBar(ctrl)
    ])
  ])
}

export function overlay(ctrl: AnalyseCtrl) {
  return [
    renderPromotion(ctrl),
    ctrl.study ? studyActionMenu.view(ctrl.study.actionMenu) : menu.view(ctrl.menu),
    ctrl.study && ctrl.study.chat ? chatView(ctrl.study.chat) : null,
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

function viewOnlyBoard(color: Color, bounds: Bounds, isSmall: boolean, fen: string) {
  return h('section.board_wrapper', {
    className: isSmall ? 'halfsize' : ''
  }, h(ViewOnlyBoard, { orientation: color, bounds, fen }))
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

function renderAnalyseTabs(ctrl: AnalyseCtrl, availTabs: ReadonlyArray<Tab>) {

  const curTab = ctrl.currentTab(availTabs)
  const buttons = availTabs.map(b => {
    if (b.id === 'comments' && ctrl.node.comments && ctrl.node.comments.length > 0) {
      return {
        ...b,
        chip: ctrl.node.comments.length
      }
    }
    return b
  })

  return h('div.analyse-header', [
    curTab.id !== 'ceval' ? h(EvalBox, { ctrl }) : null,
    h('div.analyse-tabs', [
      h('div.tab-title', renderTabTitle(ctrl, curTab)),
      h(TabNavigation, {
        buttons,
        selectedIndex: ctrl.currentTabIndex(availTabs),
        onTabChange: ctrl.onTabChange,
        wrapperClass: 'analyse'
      })
    ])
  ])
}

function renderTabTitle(ctrl: AnalyseCtrl, curTab: Tab) {
  const defaultTitle = i18n(curTab.title)
  let children: Mithril.Children
  let key: string
  if (curTab.id === 'moves') {
    const op = renderOpening(ctrl)
    children = [op || defaultTitle]
    key = op ? 'opening' : curTab.id
  }
  else if (curTab.id === 'ceval') {
    children = [
      h('span', defaultTitle),
      ctrl.ceval.isSearching() ? h('div.ceval-spinner', 'analyzing ', h('span.fa.fa-spinner.fa-pulse')) : null
    ]
    key = ctrl.ceval.isSearching() ? 'searching-ceval' : curTab.id
  }
  else if (curTab.id === 'explorer') {
    children = [getExplorerTitle(ctrl)]
    key = curTab.id
  }
  else {
    children = [defaultTitle]
    key = curTab.id
  }

  return h.fragment({ key }, children)
}

function renderReplay(ctrl: AnalyseCtrl) {
  // TODO enable when study has write support
  // if (ctrl.study && ctrl.study.canContribute()) {
  //   return h('div.study-replayWrapper', [
  //     h('div.analyse-replayWrapper', [
  //       h(Replay, { ctrl, rightTabActive: ctrl.study.vm.showComments }),
  //       ctrl.study.vm.showComments ? renderComments(ctrl.study) : null
  //     ]),
  //     renderReplayActions(ctrl.study)
  //   ])
  // } else {
  // }

  return h('div.analyse-replayWrapper', [
    h(Replay, { ctrl, rightTabActive: false }),
  ])
}

const TabsContentRendererMap: { [id: string]: (ctrl: AnalyseCtrl) => Mithril.BaseNode } = {
  infos: renderGameInfos,
  moves: renderReplay,
  explorer: renderExplorer,
  analysis: renderAnalysis,
  ceval: renderCeval,
  pgnTags: renderPgnTags,
  comments: renderReadonlyComments,
}

function renderAnalyseTable(ctrl: AnalyseCtrl, availTabs: ReadonlyArray<Tab>) {
  return h('div.analyse-table', {
    key: 'analyse'
  }, [
    renderAnalyseTabs(ctrl, availTabs),
    h(TabView, {
      className: 'analyse-tabsContent',
      selectedIndex: ctrl.currentTabIndex(availTabs),
      contentRenderers: availTabs.map(t => () => TabsContentRendererMap[t.id](ctrl)),
      onTabChange: ctrl.onTabChange,
      boardView: true,
    }),
    ctrl.retro ? retroView(ctrl) : null
  ])
}
