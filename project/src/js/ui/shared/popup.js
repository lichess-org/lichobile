import * as utils from '../../utils';
import helper from '../helper';

function styleConf(vnode) {
  const el = vnode.dom;
  const vh = helper.viewportDim().vh;
  const h = el.getBoundingClientRect().height;
  const top = (vh - h) / 2;
  el.style.top = top + 'px';
}

export default function(classes, headerF, contentF, isShowing, closef) {
  if (!isShowing) {
    return null;
  }

  const defaultClasses = {
    overlay_popup: true,
    native_scroller: true
  };

  let className;

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
    <div className="overlay_popup_wrapper"
      onbeforeremove={(vnode, done) => {
        vnode.dom.classList.add('fading_out');
        setTimeout(done, 500);
      }}
    >
      <div className="popup_overlay_close"
        oncreate={closef ? helper.ontouch(closef) : utils.noop}
      />
      <div className={className} oncreate={styleConf}>
        {headerF ? <header>{headerF()}</header> : null}
        <div className={contentClass}>
          {contentF()}
        </div>
      </div>
    </div>
  );
}
