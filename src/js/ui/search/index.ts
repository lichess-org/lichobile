import * as helper from '../helper';
import oninit from './searchCtrl';
import view from './searchView';

export default {
  oninit: oninit,
  oncreate: helper.viewFadeIn,
  view
};
