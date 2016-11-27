import i18n from '../../i18n';
import loginModal from '../loginModal';
import popupWidget from '../shared/popup';
import router from '../../router';
import * as helper from '../helper';
import * as m from 'mithril';

export default {

  controller: function(root) {
    let isOpen = false;

    function open() {
      router.backbutton.stack.push(close);
      isOpen = true;
    }

    function close(fromBB) {
      if (fromBB !== 'backbutton' && isOpen) router.backbutton.stack.pop();
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
      'trainingMenu',
      null,
      renderTrainingMenu.bind(undefined, ctrl.root),
      ctrl.isOpen(),
      ctrl.close
    );
  }
};

export function renderUserInfos(ctrl) {
  return [
    m('p', m.trust(i18n('yourPuzzleRatingX', `<strong>${ctrl.data.user.rating}</strong>`)))
  ];
}

export function renderSigninBox() {
  return m('div', [
    m('p', i18n('toTrackYourProgress')),
    m('p',
      m('button', {
        oncreate: helper.ontap(loginModal.open)
      }, [m('span.fa.fa-user'), i18n('signIn')])
    ),
    m('p', i18n('trainingSignupExplanation'))
  ]);
}

function renderTrainingMenu(ctrl) {
  if (ctrl.data.user) {
    return renderUserInfos(ctrl);
  } else {
    return renderSigninBox();
  }
}
