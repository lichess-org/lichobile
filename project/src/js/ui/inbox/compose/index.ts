import * as helper from '../../helper';
import oninit from './composeCtrl';
import view from './composeView';

export default {
  oncreate: helper.viewFadeIn,
  onbeforeremove: helper.viewFadeOut,
  oninit,
  view
};
