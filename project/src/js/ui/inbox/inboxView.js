import {header } from '../shared/common';
import layout from '../layout';
import i18n from '../../i18n';
import * as m from 'mithril';

export default function view(vnode) {
  const ctrl = vnode.state;
  const bodyCtrl = tournamentListBody.bind(undefined, ctrl);

  return layout.free(header.bind(undefined, i18n('inbox')), bodyCtrl);
}


function tournamentListBody(ctrl) {
  if (!ctrl.threads() || !ctrl.threads().currentPageResults) return null;
  console.log("past guard");
  return (
    <div className="inboxWrapper">
      <table>
        <tbody>
          {ctrl.threads().currentPageResults.map(renderInboxItem)}
        </tbody>
      </table>
    </div>
  );
}

function renderInboxItem(thread) {
  /*
  const id = thread.id;
  const author = thread.author;
  const name = thread.name;
  */
  const time = window.moment().unix(thread.updatedAt);
  // console.log(time.format());
  return (
    <tr>
      <td> { thread.id } </td>
      <td> { thread.author } </td>
      <td> { thread.name } </td>
      <td> { thread.updatedAt } </td>
    </tr>
  );
}
