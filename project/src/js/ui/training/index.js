import helper from '../helper';
import oninit from './trainingCtrl';
import view from './trainingView';

export default {
  oninit,
  oncreate: helper.viewFadeIn,
  onbeforeremove: helper.onPageLeave(
    helper.viewFadeOut,
    () => window.plugins.insomnia.allowSleepAgain()
  ),
  view
};
