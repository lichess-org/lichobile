import * as utils from '../../utils';
import helper from '../helper';
import assign from 'lodash/object/assign';

function styleConf(el) {
  const vh = helper.viewportDim().vh;
  const h = el.getBoundingClientRect().height;
  const top = (vh - h) / 2;
  el.style.top = top + 'px';
}

export default function(classes, header, contentF, isShowing, closef) {
  if (!isShowing)
    return <div className="overlay_popup_wrapper" />;

  const defaultClasses = {
    overlay_popup: true,
    native_scroller: true
  };

  let className;

  if (typeof classes === 'object')
    className = helper.classSet(assign({}, defaultClasses, classes));
  else if (typeof classes === 'string')
    className = helper.classSet(defaultClasses) + ' ' + classes;
  else
    throw new Error('First popup argument must be either a string or an object');

  return (
    <div className="overlay_popup_wrapper open">
      <div className="popup_overlay_close" config={closef ? helper.ontouch(closef) : utils.noop} />
      <div className={className} config={styleConf}>
        {header ? <header>{header}</header> : null}
        <div className="popup_content">
          {contentF()}
        </div>
      </div>
    </div>
  );
}
