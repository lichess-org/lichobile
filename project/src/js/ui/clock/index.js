import helper from '../helper';
import oninit from './clockCtrl';
import view from './clockView';

export default {
  oninit,
  oncreate: helper.viewFadeIn,
  onbeforeremove: helper.viewFadeOut,
  view
};
