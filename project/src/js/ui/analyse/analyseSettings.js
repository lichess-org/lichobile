import i18n from '../../i18n';
import popupWidget from '../shared/popup';
import backbutton from '../../backbutton';
import gameApi from '../../lichess/game';
import settings from '../../settings';
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
      renderAnalyseSettings.bind(undefined, ctrl.root),
      ctrl.isOpen(),
      ctrl.close
    );
  }
};

function renderAnalyseSettings(ctrl) {

  return m('div.analyseSettings', [
    ctrl.ceval.allowed() ? m('div.action', {
      key: 'enableCeval'
    }, [
      formWidgets.renderCheckbox(
        i18n('enableLocalComputerEvaluation'), 'allowCeval', settings.analyse.enableCeval,
        v => {
          ctrl.ceval.toggle();
          if (v) ctrl.initCeval();
          else ctrl.ceval.destroy();
        }
      ),
      m('small.caution', i18n('localEvalCaution'))
    ]) : null,
    ctrl.ceval.allowed() ? m('div.action', {
      key: 'showBestMove'
    }, [
      formWidgets.renderCheckbox(
        i18n('showBestMove'), 'showBestMove', settings.analyse.showBestMove,
        ctrl.toggleBestMove
      )
    ]) : null,
    ctrl.source === 'online' && gameApi.analysable(ctrl.data) ? m('div.action', {
      key: 'showComments'
    }, [
      formWidgets.renderCheckbox(
        i18n('keyShowOrHideComments'), 'showComments', settings.analyse.showComments,
        ctrl.toggleComments
      )
    ]) : null
  ]);
}

