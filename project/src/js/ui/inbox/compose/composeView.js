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
    <div className="composeWrapper">
      <form id="composeForm"
      onsubmit={function(e) {
        e.preventDefault();
        return ctrl.send(e.target);
      }}>
        {ctrl.id() ? recipientWithName(ctrl) : recipientWithoutName()}
        <div key="recipientError" className="errorMessage">
          {(ctrl.errors() && ctrl.errors().username) ? ctrl.errors().username[0] : null}
        </div>
        <input id="subject" type="text" className="composeInput"
        placeholder={i18n('subject')}
        />
        <div key="subjectError" className="errorMessage">
          {(ctrl.errors() && ctrl.errors().subject) ? ctrl.errors().subject[0] : null}
        </div>
        <textarea id="body" className="composeInput" />
        <div key="textError" className="errorMessage">
          {(ctrl.errors() && ctrl.errors().text) ? ctrl.errors().text[0] : null}
        </div>
        <button key="send" className="fatButton composeSend" type="submit">
          <span className="fa fa-check" />
          {i18n('send')}
        </button>
      </form>
    </div>
  );
}

function recipientWithName(ctrl) {
  return (
    <input id="recipient" type="text" className="composeInput"
    placeholder={i18n('recipient')}
    autocapitalize="off"
    autocomplete="off"
    oncreate={h.autofocus}
    value={ctrl.id() ? ctrl.id() : null}
    />
  );
}

function recipientWithoutName() {
  return (
    <input id="recipient" type="text" className="composeInput"
    placeholder={i18n('recipient')}
    autocapitalize="off"
    autocomplete="off"
    oncreate={h.autofocus}
    />
  );
}
