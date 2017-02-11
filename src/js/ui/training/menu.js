import i18n from '../../i18n';
import loginModal from '../loginModal';
import popupWidget from '../shared/popup';
import router from '../../router';
import * as helper from '../helper';
import * as h from 'mithril/hyperscript';
import * as Chart from 'chart.js';

Chart.defaults.global.animation = false;

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
    h('p.trainingRatingHeader', h.trust(i18n('yourPuzzleRatingX', `<strong>${ctrl.data.user.rating}</strong>`))),
    ctrl.data.user.history ? h('canvas', {
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
  return h('div.trainingMenuContent', [
    h('p', i18n('toTrackYourProgress')),
    h('p',
      h('button', {
        oncreate: helper.ontap(loginModal.open)
      }, [h('span.fa.fa-user'), i18n('signIn')])
    ),
    h('p', i18n('trainingSignupExplanation'))
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
  const c = new Chart(ctx, {
    type: 'line',
    data: {
      labels: ctrl.data.user.history.map(() => ''),
      datasets: [{
        data: ctrl.data.user.history,
        borderColor: 'rgba(196, 168, 111, 0.8)',
        pointRadius: 0,
        fill: false
      }]
    },
    options: {
      scales: {
        xAxes: [{
          display: false
        }],
        yAxes: [{
          id: 'y',
          type: 'linear',
          gridLines: {
            color: '#ddd'
          }
        }]
      },
      legend: {
        display: false
      }
    }
  });
  return c;
}

function renderTrainingMenu(ctrl) {
  if (ctrl.data.user) {
    return renderUserInfos(ctrl);
  } else {
    return renderSigninBox();
  }
}
