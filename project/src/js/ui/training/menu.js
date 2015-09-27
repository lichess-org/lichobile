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

export function renderUserInfos(ctrl) {
  return [
    m('p', m.trust(i18n('yourPuzzleRatingX', `<strong>${ctrl.data.user.rating}</strong>`))),
    helper.isPortrait() ? m('br') : null,
    ctrl.data.user.history ? m('canvas#puzzleChart', {
      width: '240px',
      height: '150px',
      config: function(el, isUpdate, context) {
        const hash = ctrl.data.user.history.join('') + (helper.isPortrait() ? 'portrait' : 'landscape');
        if (hash === context.hash) return;
        context.hash = hash;
        const ctx = document.getElementById('puzzleChart').getContext('2d');
        if (helper.isPortrait()) {
          ctx.canvas.width = ctx.canvas.parentElement.offsetWidth - 20;
        } else {
          ctx.canvas.width = ctx.canvas.parentElement.offsetWidth;
          ctx.canvas.height = ctx.canvas.parentElement.offsetHeight - 20;
        }
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
    }) : null
  ];
}

export function renderSigninBox() {
  return m('div', [
    m('p', i18n('toTrackYourProgress')),
    m('p',
      m('button.fa.fa-user', {
        config: helper.ontouch(loginModal.open)
      }, i18n('signIn'))
    ),
    m('p', i18n('trainingSignupExplanation'))
  ]);
}

function renderTrainingMenu(ctrl) {
  if (ctrl.data.user) {
    if (helper.isPortrait())
      return renderUserInfos(ctrl).concat(renderDifficulty(ctrl));
    else
      return renderDifficulty(ctrl);
  } else {
    return renderSigninBox();
  }
}
