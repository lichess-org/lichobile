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
  const bodyCtrl = () => composeBody(ctrl);
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
        {(ctrl.errors() && ctrl.errors().username) ? renderError('recipientError', ctrl.errors().username[0]) : null}
        <input id="subject" key="subject" type="text" className="composeInput"
        placeholder={i18n('subject')}
        oncreate={ctrl.id() ? h.autofocus : null}
        />
        {(ctrl.errors() && ctrl.errors().subject) ? renderError('subjectError', ctrl.errors().subject[0]) : null}
        <textarea id="body" key="body" className="composeInput" />
        {(ctrl.errors() && ctrl.errors().text) ? renderError('textError', ctrl.errors().text[0]) : null}
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
    <input id="recipient" key="recipient" type="text" className="composeInput"
    placeholder={i18n('recipient')}
    autocapitalize="off"
    autocomplete="off"
    value={ctrl.id()}
    />
  );
}

function recipientWithoutName() {
  return (
    <input id="recipient" key="recipient" type="text" className="composeInput"
    placeholder={i18n('recipient')}
    autocapitalize="off"
    autocomplete="off"
    oncreate={h.autofocus}
    />
  );
}

function renderError(divKey: string, errorMessage: string) {
  return (
    <div key={divKey} className="errorMessage">
      {errorMessage}
    </div>
  );
}
