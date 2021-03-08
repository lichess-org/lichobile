import h from 'mithril/hyperscript'
import announce, { Announcement } from '~/announce'
import { distanceToNowStrict } from '~/i18n'
import { prop } from '~/utils'
import redraw from '~/utils/redraw'
import { ontap } from './helper'

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
    h('span', distanceToNowStrict(new Date(announcement.date), true)),
    h('span.fa.fa-times.dismiss', {
      oncreate: ontap(announce.dismiss)
    })
  ])
}
