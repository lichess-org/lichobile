import * as h from '../helper';
import router from '../../router';
import {header } from '../shared/common';
import layout from '../layout';
import i18n from '../../i18n';
import * as m from 'mithril';

export default function view(vnode) {
  const ctrl = vnode.state;
  const bodyCtrl = inboxBody.bind(undefined, ctrl);

  return layout.free(header.bind(undefined, i18n('inbox')), bodyCtrl);
}


function inboxBody(ctrl) {
  if (!ctrl.threads() || !ctrl.threads().currentPageResults) return null;

  return (
    <div className="inboxWrapper native_scroller">
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
    <tr className={'list_item' + (thread.isUnread ? 'unread' : '')}
    key={thread.id}
    oncreate={h.ontapY(() => router.set('/inbox/' + thread.id))}>
      <td className="threadAuthor"> { thread.author } </td>
      <td className="threadName"> { thread.name } </td>
      <td className="threadDate"> { formatMessageTime(window.moment(thread.updatedAt)) } </td>
    </tr>
  );
}

function formatMessageTime (time) {
  const now = window.moment();
  if (now.isAfter(time, 'day')) {
    return time.format('MMM D');
  }
  else {
    return time.format('h:mm');
  }
}
