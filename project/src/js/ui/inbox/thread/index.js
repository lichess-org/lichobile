import * as helper from '../../helper';
import oninit from './threadCtrl';
import view from './threadView';

export default {
  oncreate: helper.viewFadeIn,
  onbeforeremove: helper.viewFadeOut,
  oninit,
  view
};
