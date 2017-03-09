import * as helper from '../helper'
import router from '../../router'
import {header } from '../shared/common'
import layout from '../layout'
import i18n from '../../i18n'
import {InboxState, Thread} from './interfaces'

export default function view(vnode: Mithril.Vnode<void, InboxState>) {
  const ctrl = vnode.state as InboxState
  const headerCtrl = () => header(i18n('inbox'))
  const bodyCtrl = () => inboxBody(ctrl)
  const footer = () => renderFooter(ctrl)
  return layout.free(headerCtrl, bodyCtrl, footer, undefined)
}

function inboxBody(ctrl: InboxState) {
  if (!ctrl.threads() || !ctrl.threads().currentPageResults) return null
  const threads = ctrl.threads()
  if (threads.nbResults === 0) {
    return <div className="emptyInbox"> {i18n('noNewMessages')} </div>
  }

  return (
    <div className="native_scroller inboxWrapper">
      <table className="threadList">
        <tbody>
          {threads.currentPageResults.map(renderInboxItem)}
        </tbody>
      </table>
    </div>
  )
}

function renderNavButton(icon: string, isEnabled: boolean, action: () => void) {
  const state = isEnabled ? 'enabled' : 'disabled'
  return (
    <button className={`navigationButton ${state}`}
      data-icon={icon} oncreate={helper.ontap(action)} />
  )
}

function renderInboxItem(thread: Thread) {
  return (
    <tr className={'list_item' + (thread.isUnread ? ' unread' : '')}
    key={thread.id}
    oncreate={helper.ontapY(() => router.set('/inbox/' + thread.id))}>
      <td className="threadAuthor"> { thread.author } </td>
      <td className="threadName"> { thread.name } </td>
      <td className="threadDate"> { formatMessageTime(thread.updatedAt) } </td>
    </tr>
  )
}

function formatMessageTime (timeInMillis: number) {
  const time = window.moment(timeInMillis)
  const now = window.moment()
  if (now.isAfter(time, 'year')) {
    return time.format('MM/YY')
  } else if (now.isAfter(time, 'day')) {
    return time.format('MMM D')
  } else {
    return time.format('H:mm')
  }
}

function renderFooter(ctrl: InboxState) {
  if (!ctrl.threads()) {
    return null
  }
  const threads = ctrl.threads()
  const backEnabled = threads.currentPage > 1
  const forwardEnabled = threads.currentPage < threads.nbPages

  return (
    <div className="inboxFooter">
      <div className={'navigationButtons' + (threads.nbPages <= 1 ? ' invisible' : '')}>
        {renderNavButton('W', !ctrl.isLoading() && backEnabled, ctrl.first)}
        {renderNavButton('Y', !ctrl.isLoading() && backEnabled, ctrl.prev)}
        {renderNavButton('X', !ctrl.isLoading() && forwardEnabled, ctrl.next)}
        {renderNavButton('V', !ctrl.isLoading() && forwardEnabled, ctrl.last)}
      </div>
      <div className="actions_bar composeAction">
        <button key="compose" className="action_bar_button" oncreate={helper.ontapY(() => router.set('/inbox/new'))}>
          <span className="fa fa-pencil" />
          {i18n('composeMessage')}
        </button>
      </div>
    </div>
  )
}
