import * as h from '../../helper';
import { header as headerWidget, backButton } from '../../shared/common';
import layout from '../../layout';
import i18n from '../../../i18n';
import { ComposeAttrs, ComposeState } from '../interfaces';

export default function view(vnode: Mithril.Vnode<ComposeAttrs>) {
  const ctrl = vnode.state as ComposeState;
  const headerCtrl = () => headerWidget(null,
    backButton(i18n('composeMessage'))
  );
  const bodyCtrl = composeBody.bind(undefined, ctrl);
  return layout.free(headerCtrl, bodyCtrl, undefined, undefined);
}

function composeBody(ctrl: ComposeState) {
  return (
    <div className="composeWrapper">
      <form id="composeForm"
      onsubmit={function(e: Event) {
        e.preventDefault();
        return ctrl.send(e.target as HTMLFormElement);
      }}>
        {ctrl.id() ? recipientWithName(ctrl) : recipientWithoutName()}
        <div key="recipientError" className="errorMessage">
          {(ctrl.errors() && ctrl.errors().username) ? ctrl.errors().username[0] : null}
        </div>
        <input id="subject" type="text" className="composeInput"
        placeholder={i18n('subject')}
        oncreate={ctrl.id() ? h.autofocus : null}
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

function recipientWithName(ctrl: ComposeState) {
  return (
    <input id="recipient" type="text" className="composeInput"
    placeholder={i18n('recipient')}
    autocapitalize="off"
    autocomplete="off"
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
