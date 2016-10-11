import * as h from '../helper';
import router from '../../router';
import {header } from '../shared/common';
import layout from '../layout';
import i18n from '../../i18n';
import {InboxState, Thread} from './interfaces';

export default function view(vnode: Mithril.Vnode<{}>) {
  const ctrl = vnode.state as InboxState;
  const bodyCtrl = inboxBody.bind(undefined, ctrl);
  const footer = () => renderFooter(ctrl);
  return layout.free(header.bind(undefined, i18n('inbox')), bodyCtrl, footer, undefined);
}

function inboxBody(ctrl: InboxState) {
  if (!ctrl.threads() || !ctrl.threads().currentPageResults) return null;
  const threads = ctrl.threads();
  if (threads.nbResults === 0) {
    return (<div className="emptyInbox"> {i18n('noNewMessages')} </div>);
  }

  const backEnabled = threads.currentPage > 1;
  const forwardEnabled = threads.currentPage < threads.nbPages;

  return (
    <div className="native_scroller inboxWrapper">
      <table className="threadList">
        <tbody>
          {threads.currentPageResults.map(renderInboxItem)}
        </tbody>
      </table>
      <div className={'navigationButtons' + (threads.nbPages <= 1 ? ' invisible' : '')}>
        {renderNavButton('W', !ctrl.isLoading() && backEnabled, ctrl.first)}
        {renderNavButton('Y', !ctrl.isLoading() && backEnabled, ctrl.prev)}
        {renderNavButton('X', !ctrl.isLoading() && forwardEnabled, ctrl.next)}
        {renderNavButton('V', !ctrl.isLoading() && forwardEnabled, ctrl.last)}
      </div>
    </div>
  );
}

function renderNavButton(icon: string, isEnabled: boolean, action: () => void) {
  const state = isEnabled ? 'enabled' : 'disabled';
  return (
    <button className={`navigationButton ${state}`}
      data-icon={icon} oncreate={h.ontap(action)} />
  );
}

function renderInboxItem(thread: Thread) {
  return (
    <tr className={'list_item' + (thread.isUnread ? ' unread' : '')}
    key={thread.id}
    oncreate={h.ontapY(() => router.set('/inbox/' + thread.id))}>
      <td className="threadAuthor"> { thread.author } </td>
      <td className="threadName"> { thread.name } </td>
      <td className="threadDate"> { formatMessageTime(thread.updatedAt) } </td>
    </tr>
  );
}

function formatMessageTime (timeInMillis: number) {
  const time = window.moment(timeInMillis);
  const now = window.moment();
  if (now.isAfter(time, 'day')) {
    return time.format('MMM D');
  }
  else {
    return time.format('H:mm');
  }
}

function renderFooter(ctrl: InboxState) {
  if (!ctrl.threads()) {
    return null;
  }

  return (
    <div className="actions_bar">
      <button key="compose" className="action_bar_button" oncreate={h.ontapY(() => router.set('/inbox/new'))}>
        <span className="fa fa-pencil" />
        {i18n('composeMessage')}
      </button>
    </div>
  );
}
