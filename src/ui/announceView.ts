import h from 'mithril/hyperscript'
import announce, { Announcement } from '~/announce'
import { distanceToNowStrict } from '~/i18n'
import { prop } from '~/utils'
import redraw from '~/utils/redraw'
import { ontap } from './helper'
import { closeIcon } from './shared/icons'

const expanded = prop(false)

export default function renderAnnouncement(announcement?: Announcement): Mithril.Child {
  if (!announcement) {
    return null
  }

  return h('div.announce', {
    className: expanded() ? 'expanded' : '',
  }, [
    h('span.text', {
      oncreate: ontap(() => {
        expanded(!expanded())
        redraw()
      })
    }, announcement.msg),
    h('small', distanceToNowStrict(new Date(announcement.date), true)),
    h('button.dismiss', {
      oncreate: ontap(announce.dismiss)
    }, closeIcon)
  ])
}
