import i18n from '../../i18n';
import popupWidget from '../shared/popup';
import backbutton from '../../backbutton';
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
    m('button.fa.fa-eye', {
      key: 'startNewAnalysis',
      config: helper.ontouch(ctrl.startNewAnalysis)
    }, i18n('startNewAnalysis')),
    m('button.fa.fa-pencil', {
      key: 'boardEditor',
      config: helper.ontouch(() => m.route(`/editor/${encodeURIComponent(ctrl.vm.step.fen)}`))
    }, i18n('boardEditor')),
    m('button[data-icon=U]', {
      key: 'continueFromHere',
      config: helper.ontouch(() => ctrl.continuePopup.open(ctrl.vm.step.fen))
    }, i18n('continueFromHere')),
    m('div.action', {
      key: 'enableCeval'
    }, [
      formWidgets.renderCheckbox(
        i18n('enableLocalComputerEvaluation'), 'allowCeval', settings.analyse.enableCeval,
        v => {
          if (v) ctrl.startCeval();
          else ctrl.ceval.stop();
        }
      ),
      m('small.caution', i18n('localEvalCaution'))
    ]),
    settings.analyse.enableCeval() ? m('div.action', {
      key: 'showBestMove'
    }, [
      formWidgets.renderCheckbox(
        i18n('showBestMove'), 'showBestMove', settings.analyse.showBestMove,
        ctrl.toggleBestMove
      )
    ]) : null
  ]);
}

