import oninit from './trainingCtrl';
import view from './trainingView';

export default {
  oninit,
  cleanup() {
    window.plugins.insomnia.allowSleepAgain();
  },
  view
};
