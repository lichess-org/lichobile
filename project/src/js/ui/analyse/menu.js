import i18n from '../../i18n';
import popupWidget from '../shared/popup';
import backbutton from '../../backbutton';
import gameApi from '../../lichess/game';
import settings from '../../settings';
import helper from '../helper';
import formWidgets from '../shared/form';
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
      'analyse_menu',
      null,
      renderAnalyseMenu.bind(undefined, ctrl.root),
      ctrl.isOpen(),
      ctrl.close
    );
  }
};

function renderAnalyseMenu(ctrl) {

  return m('div.analyseMenu', [
    m('button', {
      key: 'startNewAnalysis',
      config: helper.ontouch(ctrl.startNewAnalysis)
    }, [m('span.fa.fa-eye'), i18n('startNewAnalysis')]),
    ctrl.source === 'offline' || !gameApi.playable(ctrl.data) ? m('button[data-icon=U]', {
      key: 'continueFromHere',
      config: helper.ontouch(() => ctrl.continuePopup.open(ctrl.vm.step.fen))
    }, i18n('continueFromHere')) : null,
    ctrl.source === 'offline' || !gameApi.playable(ctrl.data) ? m('button', {
      key: 'boardEditor',
      config: helper.ontouch(() => m.route(`/editor/${encodeURIComponent(ctrl.vm.step.fen)}`))
    }, [m('span.fa.fa-pencil'), i18n('boardEditor')]) : null,
    ctrl.ceval.allowed() ? m('div.action', {
      key: 'enableCeval'
    }, [
      formWidgets.renderCheckbox(
        i18n('enableLocalComputerEvaluation'), 'allowCeval', settings.analyse.enableCeval,
        v => {
          ctrl.ceval.toggle();
          if (v) ctrl.startCeval();
          else ctrl.ceval.destroy();
        }
      ),
      m('small.caution', i18n('localEvalCaution'))
    ]) : null,
    ctrl.ceval.allowed() && settings.analyse.enableCeval() ? m('div.action', {
      key: 'showBestMove'
    }, [
      formWidgets.renderCheckbox(
        i18n('showBestMove'), 'showBestMove', settings.analyse.showBestMove,
        ctrl.toggleBestMove
      )
    ]) : null
  ]);
}

