import h from 'mithril/hyperscript'
import router from '../../../router'
import i18n from '../../../i18n'
import settings from '../../../settings'
import * as utils from '../../../utils'
import { emptyFen } from '../../../utils/fen'
import continuePopup from '../../shared/continuePopup'
import { isTablet } from '../../helper'
import spinner from '../../../spinner'
import { view as renderPromotion } from '../../shared/offlineRound/promotion'
import ViewOnlyBoard from '../../shared/ViewOnlyBoard'
import { notesView } from '../../shared/round/notes'
import TabNavigation from '../../shared/TabNavigation'
import TabView from '../../shared/TabView'
import { loadingBackbutton } from '../../shared/common'
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
import renderCrazy, { renderPlayer as renderCrazyPlayer, renderOpponent as renderCrazyOpponent } from '../crazy/crazyView'
import { view as renderContextMenu } from '../contextMenu'
import Replay from './Replay'
import retroView from '../retrospect/retroView'
import practiceView from '../practice/practiceView'
import renderAnalysis from './analysisView'
import renderBoard from './boardView'
import renderGameInfos from './gameInfosView'
import renderActionsBar from './actionsView'

export function loadingScreen(isPortrait: boolean, color?: Color, curFen?: string) {
  const isSmall = settings.analyse.smallBoard()
  return layout.board(
    loadingBackbutton(),
    [
      viewOnlyBoard(color || 'white', isSmall, curFen || emptyFen),
      h('div.analyse-tableWrapper', spinner.getVdom('monochrome')),
      isPortrait ? h('section.analyse_actions_bar') : null,
    ]
  )
}

export function renderContent(ctrl: AnalyseCtrl, isPortrait: boolean) {
  const availTabs = ctrl.availableTabs()
  const tablet = isTablet()

  return h.fragment({
    key: 'size' + ctrl.settings.s.smallBoard,
  }, [
    renderBoard(ctrl),
    h('div.analyse-tableWrapper', [
      ctrl.data.game.variant.key === 'crazyhouse' && (isPortrait || !tablet) ? renderCrazy(ctrl) : null,
      !isPortrait && tablet ? renderCrazyPlayer(ctrl) : null,
      renderAnalyseTable(ctrl, availTabs),
      !isPortrait ? renderActionsBar(ctrl, isPortrait) : null,
      !isPortrait && tablet ? renderCrazyOpponent(ctrl) : null,
    ]),
    isPortrait ? renderActionsBar(ctrl, isPortrait) : null,
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

function viewOnlyBoard(color: Color, isSmall: boolean, fen: string) {
  return h('section.board_wrapper.analyse-boardWrapper', {
    className: isSmall ? 'halfsize ' : ''
  }, h(ViewOnlyBoard, { orientation: color, fen }))
}

function renderOpening(ctrl: AnalyseCtrl) {
  const opening = ctrl.tree.getOpening(ctrl.nodeList) || ctrl.data.game.opening
  if (opening) return h('div', [
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
  if (curTab.id === 'moves') {
    const op = renderOpening(ctrl)
    children = [op || defaultTitle]
  }
  else if (curTab.id === 'ceval') {
    children = [
      h('span',
        ctrl.ceval.getEngineName() + (window.lichess.buildConfig.NNUE ?
          ` (${ctrl.ceval.getEngineEvaluation()})` : '')
      ),
      ctrl.ceval.isSearching() ? h('div.ceval-spinner', h('span.fa.fa-spinner.fa-pulse')) : null
    ]
  }
  else if (curTab.id === 'explorer') {
    children = [getExplorerTitle(ctrl)]
  }
  else {
    children = [defaultTitle]
  }

  return h.fragment({}, children)
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

const TabsContentRendererMap: { [id: string]: (ctrl: AnalyseCtrl) => Mithril.Children } = {
  infos: renderGameInfos,
  moves: renderReplay,
  explorer: renderExplorer,
  analysis: renderAnalysis,
  ceval: renderCeval,
  pgnTags: renderPgnTags,
  comments: renderReadonlyComments,
}

function renderAnalyseTable(ctrl: AnalyseCtrl, availTabs: ReadonlyArray<Tab>) {
  return h('div.analyse-table.box', [
    renderAnalyseTabs(ctrl, availTabs),
    h(TabView, {
      className: 'analyse-tabsContent',
      selectedIndex: ctrl.currentTabIndex(availTabs),
      tabs: availTabs.map(t => ({
        id: t.id,
        f: () => TabsContentRendererMap[t.id](ctrl)
      })),
      onTabChange: ctrl.onTabChange,
      boardView: true,
    }),
    ctrl.retro ? retroView(ctrl) : null,
    ctrl.practice ? practiceView(ctrl) : null,
  ])
}
