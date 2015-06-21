import utils from '../../utils';
import helper from '../helper';

export default function popup(className, header, content, isShowing, closef) {
  if (!isShowing) return m('div.overlay.popup.overlay_fade');
  return m('div.overlay.popup.overlay_fade.open', [
    m('div.popup_overlay_close', {
      config: closef ? helper.ontouch(closef) : utils.noop
    }),
    m('div.overlay_popup', {
      className: className ? className : '',
      config: function(el) {
        var vh = helper.viewportDim().vh;
        var h = el.getBoundingClientRect().height;
        var top = (vh - h) / 2;
        el.style.top = top + 'px';
      }
    }, [
      header ? m('header', header) : null,
      m('div.popup_content.native_scroller', content)
    ])
  ]);
}
