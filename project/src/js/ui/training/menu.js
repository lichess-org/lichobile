import i18n from '../../i18n';
import loginModal from '../loginModal';
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
      'trainingMenu',
      m('h2[data-icon=-]', i18n('training')),
      renderTrainingMenu.bind(undefined, ctrl.root),
      ctrl.isOpen(),
      ctrl.close
    );
  }
};


function renderUserInfos(ctrl) {
  return m('div', [
    m('p', i18n('yourPuzzleRatingX', ctrl.data.user.rating))
  ]);
}

function renderTrainingMenu(ctrl) {
  return ctrl.data.user ? renderUserInfos(ctrl) : [
    m('p', i18n('toTrackYourProgress')),
    m('p',
      m('button.fa.fa-user', {
        config: helper.ontouch(loginModal.open)
      }, i18n('signIn'))
    ),
    m('p', i18n('trainingSignupExplanation'))
  ];
}

function renderDifficulty(ctrl) {
  return m('div.difficulty.buttonset', ctrl.data.difficulty.choices.map(function(dif) {
    var id = dif[0],
      name = dif[1];
    return m('a.button' + (id == ctrl.data.difficulty.current ? '.active' : ''), {
      disabled: id == ctrl.data.difficulty.current,
      config: helper.ontouch(ctrl.setDifficulty.bind(ctrl, id))
    }, name);
  }));
}
