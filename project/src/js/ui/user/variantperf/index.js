import helper from '../../helper';
import oninit from './variantPerfCtrl';
import view from './variantPerfView';

export default {
  oninit,
  oncreate: helper.viewSlideIn,
  onbeforeremove: helper.viewSlideOut,
  view
};
