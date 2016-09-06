import * as helper from '../../helper';
import oninit from './followersCtrl';
import view from './followersView';

export default {
  oninit,
  oncreate: helper.viewFadeIn,
  onbeforeremove: helper.viewFadeOut,
  view
};
