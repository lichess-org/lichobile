import i18n from '../../i18n';
import loginModal from '../loginModal';
import popupWidget from '../shared/popup';
import backbutton from '../../backbutton';
import * as helper from '../helper';
import * as m from 'mithril';
import * as Chart from 'chart.js';
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
      null,
      renderTrainingMenu.bind(undefined, ctrl.root),
      ctrl.isOpen(),
      ctrl.close
    );
  }
};

export function renderUserInfos(ctrl) {
  return [
    m('p', m.trust(i18n('yourPuzzleRatingX', `<strong>${ctrl.data.user.rating}</strong>`))),
    helper.isPortrait() ? m('br') : null,
    ctrl.data.user.history ? m('canvas', {
      oncreate(vnode) {
        const ctx = vnode.dom.getContext('2d');
        drawChart(ctrl, ctx);
        vnode.state.hash = chartHash(ctrl);
      },
      onupdate(vnode) {
        const hash = chartHash(ctrl);
        if (hash === vnode.state.hash) return;
        vnode.state.hash = hash;
        const ctx = vnode.dom.getContext('2d');
        drawChart(ctrl, ctx);
      }
    }) : null
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

function chartHash(ctrl) {
  return ctrl.data.user.history.join('') + (helper.isPortrait() ? 'portrait' : 'landscape');
}

function drawChart(ctrl, ctx) {
  const canvas = ctx.canvas;
  if (helper.isPortrait()) {
    canvas.width = canvas.style.width = canvas.parentElement.offsetWidth - 20;
    canvas.height = canvas.style.height = 150;
  } else {
    canvas.width = canvas.style.width = canvas.parentElement.offsetWidth;
    canvas.height = canvas.style.height = canvas.parentElement.offsetHeight - 20;
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

function renderDifficulty(ctrl) {
  const opts = ctrl.data.difficulty.choices.map(c => ['difficulty' + c[1], c[0]]);
  return m('div.select_input.puzzleDifficulty',
    formWidgets.renderSelect('level', 'difficulty', opts,
      () => ctrl.data.difficulty.current, false, ctrl.setDifficulty)
  );
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
