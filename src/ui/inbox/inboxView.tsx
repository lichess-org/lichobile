import h from 'mithril/hyperscript'
import * as helper from '../helper'
import router from '../../router'
import i18n, { fromNow } from '../../i18n'
import { Thread } from './interfaces'

import { InboxCtrl } from './inbox'

export function inboxBody(ctrl: InboxCtrl) {
  const threads = ctrl.threads()
  if (!threads || !threads.currentPageResults) return null
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

export function renderFooter(ctrl: InboxCtrl) {
  const threads = ctrl.threads()
  if (!threads) {
    return null
  }
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
        <button className="action_bar_button" oncreate={helper.ontapY(() => router.set('/inbox/new'))}>
          <span className="fa fa-pencil" />
          {i18n('composeMessage')}
        </button>
      </div>
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
  return fromNow(new Date(timeInMillis))
}
