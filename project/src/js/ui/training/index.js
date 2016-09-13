import * as helper from '../helper';
import oninit from './trainingCtrl';
import view from './trainingView';

export default {
  oninit,
  oncreate: helper.viewFadeIn,
  onremove() {
    window.plugins.insomnia.allowSleepAgain();
  },
  view
};
