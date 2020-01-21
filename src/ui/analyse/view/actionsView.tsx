import h from 'mithril/hyperscript'
import { Plugins } from '@capacitor/core'
import * as helper from '../../helper'

import AnalyseCtrl from '../AnalyseCtrl'


export default function renderActionsBar(ctrl: AnalyseCtrl, isPortrait: boolean) {

  return (
    <section className="actions_bar analyse_actions_bar">
      <button
        className={'action_bar_button fa ' + (ctrl.retroGlowing ? 'fa-play glow' : 'fa-list')}
        oncreate={helper.ontap(ctrl.study ? ctrl.study.actionMenu.open : ctrl.menu.open)}
      />
      <button className="action_bar_button fa fa-gear"
        oncreate={helper.ontap(ctrl.settings.open)}
      />
      {!ctrl.study || !ctrl.study.chat ?
        <button className="action_bar_button" data-icon="B"
          oncreate={helper.ontap(ctrl.settings.flip)}
        /> : null
      }
      {ctrl.study && ctrl.study.chat ?
        <button className="action_bar_button fa fa-comments withChip"
          oncreate={helper.ontap(ctrl.study.chat.open)}
        >
          { ctrl.study.chat.nbUnread > 0 ?
          <span className="chip">
            { ctrl.study.chat.nbUnread <= 99 ? ctrl.study.chat.nbUnread : 99 }
          </span> : null
          }
        </button> : null
      }
      { isPortrait ?
        <button className={'action_bar_button fa fa-' + (ctrl.settings.s.smallBoard ? 'expand' : 'compress')}
          oncreate={helper.ontap(
            ctrl.settings.toggleBoardSize,
            () => Plugins.LiToast.show({ text: 'Expand/compress board', duration: 'short', position: 'bottom' })
          )}
        /> : null
      }
      <button className="action_bar_button fa fa-backward"
        oncreate={helper.ontap(ctrl.stoprewind, undefined, ctrl.rewind)}
      />
      <button className="action_bar_button fa fa-forward"
        disabled={!!ctrl.retro}
        oncreate={helper.ontap(ctrl.stopff, undefined, ctrl.fastforward)}
      />
      { ctrl.study ?
        <button className="action_bar_button fa fa-bars"
          oncreate={helper.ontap(ctrl.study.sideMenu.open)}
        /> : null
      }
    </section>
  )
}
