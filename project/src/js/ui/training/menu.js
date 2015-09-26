import i18n from '../../i18n';
import loginModal from '../loginModal';
import popupWidget from '../shared/popup';
import backbutton from '../../backbutton';
import helper from '../helper';
import m from 'mithril';
import Chart from 'chart.js';
import formWidgets from '../shared/form';

Chart.defaults.global.animation = false;

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

function renderDifficulty(ctrl) {
  const opts = ctrl.data.difficulty.choices.map(c => ['difficulty' + c[1], c[0]]);
  return m('div.select_input.puzzleDifficulty',
    formWidgets.renderSelect('level', 'difficulty', opts,
      () => ctrl.data.difficulty.current, false, ctrl.setDifficulty)
  );
}

function renderUserInfos(ctrl) {
  return [
    m('p', i18n('yourPuzzleRatingX', ctrl.data.user.rating)),
    m('br'),
    ctrl.data.user.history ? m('canvas#puzzleChart', {
      width: '240px',
      height: '150px',
      config: function(el, isUpdate, context) {
        const hash = ctrl.data.user.history.join('');
        if (hash == context.hash) return;
        context.hash = hash;
        const ctx = document.getElementById('puzzleChart').getContext('2d');
        ctx.canvas.width = ctx.canvas.parentElement.offsetWidth - 20;
        new Chart(ctx).Line({
          labels: ctrl.data.user.history.map(() => ''),
          datasets: [
            {
              data: ctrl.data.user.history,
              fillColor: 'rgba(196, 168, 111, 0.4)',
              strokeColor: 'rgba(196, 168, 111, 0.8)'
            }
          ]
        }, {
          pointDot: false,
          scaleShowGridLines: false
        });
      }
    }) : null,
    renderDifficulty(ctrl)
  ];
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
