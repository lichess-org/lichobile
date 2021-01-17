import i18n from "~/i18n"
import router from "~/router"
import { handleXhrError } from "~/utils"
import redraw from "~/utils/redraw"
import { viewFadeIn } from "../helper"
import layout from "../layout"
import { dropShadowHeader } from "../shared/common"
import MsgCtrl from "./ctrl"
import renderInbox from "./msg/main"
import renderOverlay from "./msg/overlay"
import { loadContacts, loadConvo } from "./network"

type Attrs = Record<string, never>
type State = { ctrl?: MsgCtrl }

export default {
  oncreate: viewFadeIn,

  oninit({ attrs }) {
    const userId: string = attrs.id
    if (userId) {
      loadConvo(userId).then(msgData => {
        this.ctrl = new MsgCtrl(msgData)
        redraw()
      }).catch((error) => {
        // no conversation with this user... _yet_
        if (error.status === 404) {
          loadContacts().then(msgData => {
            msgData.convo = {
              user: {
                id: userId,
                name: userId.toLowerCase()
              },
              msgs: [],
              relations: {},
              postable: true
            }
            this.ctrl = new MsgCtrl(msgData)
          })
        } else {
          handleXhrError(error)
          router.set('/inbox')
        }
      })
    } else {
      loadContacts().then(msgData => {
        this.ctrl = new MsgCtrl(msgData)
        redraw()
      }).catch(handleXhrError)
    }
  },

  view() {
    const headerEl = dropShadowHeader(i18n('inbox'))
    const body = renderInbox(this.ctrl)
    const overlay = renderOverlay(this.ctrl)

    return layout.free(headerEl, body, null, overlay)
  }
} as Mithril.Component<Attrs, State>
