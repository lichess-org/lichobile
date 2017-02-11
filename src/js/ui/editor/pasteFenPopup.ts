import i18n from '../../i18n';
import popupWidget from '../shared/popup';
import router from '../../router';
import * as h from 'mithril/hyperscript';
import Editor, { MenuInterface } from './Editor'

export default {

  controller: function(root: Editor) {
    let isOpen = false;

    function open() {
      router.backbutton.stack.push(close);
      isOpen = true;
    }

    function close(fromBB?: string) {
      if (fromBB !== 'backbutton' && isOpen) router.backbutton.stack.pop();
      isOpen = false;
    }

    return {
      open: open,
      close: close,
      isOpen() {
        return isOpen
      },
      root
    };
  },

  view: function(ctrl: MenuInterface) {
    return popupWidget(
      'pasteFenPopup',
      null,
      () => {
        return h('form', {
          onsubmit(e: Event) {
            e.preventDefault()
            const input = (e.target as HTMLElement)[0]
            const value = input.value
            if (value && value.length)
              ctrl.root.loadNewFen(input.value)
          }
        }, [
          h('input[type=text]', {
            placeholder: i18n('pasteThePgnStringHere')
          }),
          h('button[data-icon=E].withIcon', i18n('loadPosition'))
        ])
      },
      ctrl.isOpen(),
      ctrl.close
    );
  }
}
