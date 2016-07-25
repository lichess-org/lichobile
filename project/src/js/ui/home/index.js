import oninit from './homeCtrl';
import view from './homeView';

export default {
  oninit: oninit,
  onremove() {
    document.removeEventListener('online', this.init);
    document.removeEventListener('resume', this.onResume);
  },
  view
};
