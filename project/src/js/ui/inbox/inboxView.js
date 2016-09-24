import * as h from '../helper';
import router from '../../router';
import {header } from '../shared/common';
import layout from '../layout';
import i18n from '../../i18n';

export default function view(vnode) {
  const ctrl = vnode.state;
  const bodyCtrl = inboxBody.bind(undefined, ctrl);
  const footer = () => renderFooter(ctrl);
  return layout.free(header.bind(undefined, i18n('inbox')), bodyCtrl, footer);
}

function inboxBody(ctrl) {
  if (!ctrl.threads() || !ctrl.threads().currentPageResults) return null;
  if (ctrl.threads().nbResults === 0) {
    return (<div className="emptyInbox"> {i18n('noNewMessages')} </div>);
  }

  return (
    <div className="native_scroller inboxWrapper">
      <table className="threadList">
        <tbody>
          {ctrl.threads().currentPageResults.map(renderInboxItem)}
        </tbody>
      </table>
    </div>
  );
}

function renderInboxItem(thread) {
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

function formatMessageTime (timeInMillis) {
  const time = window.moment(timeInMillis);
  const now = window.moment();
  if (now.isAfter(time, 'day')) {
    return time.format('MMM D');
  }
  else {
    return time.format('H:mm');
  }
}

function renderFooter(ctrl) {
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
