import h from 'mithril/hyperscript'
import i18n from '../../i18n'
import popupWidget from '../shared/popup'
import router from '../../router'
import redraw from '../../utils/redraw'
import EditorCtrl from './EditorCtrl'
import { MenuInterface } from './menu'

export interface Ctrl extends MenuInterface {
  data: {
    fenError: string | null
  }
}

export default {

  controller(root: EditorCtrl): Ctrl {
    const data = {
      isOpen: false,
      fenError: null,
    }

    function open() {
      router.backbutton.stack.push(close)
      data.isOpen = true
      data.fenError = null
    }

    function close(fromBB?: string) {
      if (fromBB !== 'backbutton' && data.isOpen) router.backbutton.stack.pop()
      data.isOpen = false
    }

    return {
      open: open,
      close: close,
      isOpen() {
        return data.isOpen
      },
      root,
      data,
    }
  },

  view(ctrl: Ctrl): Mithril.Children {
    return popupWidget(
      'pasteFenPopup',
      undefined,
      () => {
        return h('form', {
          onsubmit(e: Event) {
            e.preventDefault()
            const input = (e.target as HTMLFormElement)[0] as HTMLInputElement
            const value = input.value
            if (value && value.length) {
              const isValid = ctrl.root.loadNewFen(value)
              if (!isValid) {
                ctrl.data.fenError = i18n('invalidFen')
              } else {
                ctrl.data.fenError = null
                ctrl.close()
              }
              redraw()
            }
          }
        }, [
          h('input[type=text]', {
            placeholder: i18n('pasteTheFenStringHere'),
          }),
          ctrl.data.fenError ? h('div.error', ctrl.data.fenError) : null,
          h('button[data-icon=E].withIcon.popupAction', i18n('loadPosition'))
        ])
      },
      ctrl.isOpen(),
      ctrl.close
    )
  }
}
