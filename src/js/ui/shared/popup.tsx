import * as utils from '../../utils';
import * as helper from '../helper';

export default function(
  classes: Object | string,
  headerF: () => Mithril.Children,
  contentF: () => Mithril.Children,
  isShowing: boolean,
  closef?: () => void
) {
  if (!isShowing) {
    return null;
  }

  const defaultClasses = {
    overlay_popup: true,
    native_scroller: true
  };

  let className: string;

  if (typeof classes === 'object')
    className = helper.classSet(Object.assign({}, defaultClasses, classes));
  else if (typeof classes === 'string')
    className = helper.classSet(defaultClasses) + ' ' + classes;
  else
    throw new Error('First popup argument must be either a string or an object');

  const contentClass = helper.classSet({
    'popup_content': true,
    'noheader': !headerF
  });

  return (
    // dirty hack to be sure each popup element is unique
    // TODO should refactor into a component
    <div key={String(contentF)} className="overlay_popup_wrapper fade-in"
      onbeforeremove={(vnode: Mithril.DOMNode) => {
        vnode.dom.classList.add('fading_out');
        return new Promise((resolve) => {
          setTimeout(resolve, 500);
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
  );
}
