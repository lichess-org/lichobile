import * as helper from '../helper';
import oninit from './messageCtrl';
import view from './messageView';

export default {
  oncreate: helper.viewFadeIn,
  onbeforeremove: helper.viewFadeOut,
  oninit,
  view
};
