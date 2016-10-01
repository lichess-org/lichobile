import * as h from '../../helper';
import { header as headerWidget, backButton } from '../../shared/common';
import layout from '../../layout';
import i18n from '../../../i18n';

export default function view(vnode) {
  const ctrl = vnode.state;
  const headerCtrl = () => headerWidget(null,
    backButton(i18n('composeMessage'))
  );
  const bodyCtrl = composeBody.bind(undefined, ctrl);

  return layout.free(headerCtrl, bodyCtrl);
}

function composeBody(ctrl) {
  return (
    <div className="composeWrapper" oncreate={h.slidesInUp}>
      <form id="composeForm"
      onsubmit={function(e) {
        e.preventDefault();
        return ctrl.send(e.target);
      }}>
        <input id="recipient" type="text" className="composeInput"
        placeholder={i18n('recipient')}
        autocapitalize="off"
        autocomplete="off"
        oncreate={h.autofocus}
        value={ctrl.id() ? ctrl.id() : ''}
        />
        <input id="subject" type="text" className="composeInput"
        placeholder={i18n('subject')}
        />
        <textarea id="body" className="composeInput" />
        <button key="send" className="fatButton composeSend" type="submit">
          <span className="fa fa-check" />
          {i18n('send')}
        </button>
      </form>
    </div>
  );
}
