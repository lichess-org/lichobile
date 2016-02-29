import i18n from '../../i18n';
import popupWidget from '../shared/popup';
import backbutton from '../../backbutton';
import helper from '../helper';
import m from 'mithril';

export default {

  controller: function(root) {
    let isOpen = false;

    function open() {
      backbutton.stack.push(close);
      isOpen = true;
    }

    function close(fromBB) {
      if (fromBB !== 'backbutton' && isOpen) backbutton.stack.pop();
      isOpen = false;
    }

    return {
      open: open,
      close: close,
      isOpen: function() {
        return isOpen;
      },
      root
    };
  },

  view: function(ctrl) {
    return popupWidget(
      'analyseMenu',
      () => m('h2.withIcon', i18n('analysis')),
      renderAnalyseMenu.bind(undefined, ctrl.root),
      ctrl.isOpen(),
      ctrl.close
    );
  }
};

function renderAnalyseMenu(ctrl) {
  let children;

  return m('div.analyseMenu', children);
}

