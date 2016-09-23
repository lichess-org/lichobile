import backbutton from '../../backbutton';
import redraw from '../../utils/redraw';
import router from '../../router';
import * as h from '../helper';
import * as xhr from './inboxXhr';
import i18n from '../../i18n';

export default {
  controller: function() {
    let isOpen = false;

    function open() {
      backbutton.stack.push(close);
      isOpen = true;
    }

    function close(fromBB) {
      if (fromBB !== 'backbutton' && isOpen) backbutton.stack.pop();
      isOpen = false;
    }

    return {
      open,
      close,
      isOpen: function() {
        return isOpen;
      }
    };
  },

  view: function(ctrl) {
    if (!ctrl.isOpen()) return null;
    return (
      <div className="modal" id="composeModal" oncreate={h.slidesInUp}>
        <header>
          <button className="modal_close" data-icon="L"
            oncreate={h.ontap(h.slidesOutDown(ctrl.close, 'composeModal'))}
          />
          <h2>Compose</h2>
        </header>
        <div className="modal_content">
          <span>
            {i18n('recipient')}:
            <input id="recipient" type="text"
            placeholder="Recipient"
            autocapitalize="off"
            autocomplete="off"
            oncreate={h.autofocus}
            />
          </span>
          <span>
            {i18n('subject')}:
            <input id="subject" type="text"
            placeholder="Subject"
            />
          </span>
          <span>
            <textarea id="body" />
          </span>
        </div>
      </div>
    );
  }
};
