import h from 'mithril/hyperscript'
import * as utils from '../../utils'
import * as helper from '../helper'

export default function popup(
  classes: Record<string, boolean> | string,
  headerF: (() => Mithril.Children) | undefined,
  contentF: () => Mithril.Children,
  isShowing: boolean,
  closef?: () => void
): Mithril.Vnode | null {
  if (!isShowing) {
    return null
  }

  const defaultClasses = {
    overlay_popup: true,
    native_scroller: true
  }

  let className: string

  if (typeof classes === 'object')
    className = helper.classSet({ ...defaultClasses, ...classes })
  else if (typeof classes === 'string')
    className = helper.classSet(defaultClasses) + ' ' + classes
  else
    throw new Error('First popup argument must be either a string or an object')

  const contentClass = helper.classSet({
    'popup_content': true,
    'noheader': !headerF
  })

  return (
    <div className="overlay_popup_wrapper fade-in"
      onbeforeremove={(vnode: Mithril.VnodeDOM<any, any>) => {
        vnode.dom.classList.add('fading_out')
        return new Promise((resolve) => {
          setTimeout(resolve, 500)
        })
      }}
    >
      <div className="popup_overlay_close"
        oncreate={closef ? helper.ontap(closef) : utils.noop}
      />
      <div className={className}>
        {headerF ? <header>{headerF()}</header> : null}
        <div className={contentClass}>
          {contentF()}
        </div>
      </div>
    </div>
  )
}
