import i18n from '../../i18n';
import popupWidget from '../shared/popup';
import router from '../../router';
import * as gameApi from '../../lichess/game';
import settings from '../../settings';
import formWidgets from '../shared/form';
import * as h from 'mithril/hyperscript';
import { MenuInterface, AnalyseCtrlInterface } from './interfaces';

export default {

  controller: function(root: AnalyseCtrlInterface) {
    let isOpen = false;

    function open() {
      router.backbutton.stack.push(close);
      isOpen = true;
    }

    function close(fromBB?: string) {
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

  view(ctrl: MenuInterface) {
    return popupWidget(
      'analyse_menu',
      null,
      () => renderAnalyseSettings(ctrl.root),
      ctrl.isOpen(),
      ctrl.close
    );
  }
};

function renderAnalyseSettings(ctrl: AnalyseCtrlInterface) {

  return h('div.analyseSettings', [
    ctrl.ceval.allowed ? h('div.action', {
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
      h('small.caution', i18n('localEvalCaution'))
    ]) : null,
    ctrl.ceval.allowed ? h('div.action', {
      key: 'showBestMove'
    }, [
      formWidgets.renderCheckbox(
        i18n('showBestMove'), 'showBestMove', settings.analyse.showBestMove,
        ctrl.toggleBestMove
      )
    ]) : null,
    ctrl.source === 'online' && gameApi.analysable(ctrl.data) ? h('div.action', {
      key: 'showComments'
    }, [
      formWidgets.renderCheckbox(
        i18n('keyShowOrHideComments'), 'showComments', settings.analyse.showComments,
        ctrl.toggleComments
      )
    ]) : null
  ]);
}

