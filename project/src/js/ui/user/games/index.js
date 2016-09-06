import * as helper from '../../helper';
import oninit from './gamesCtrl';
import view from './gamesView';

export default {
  oninit,
  oncreate: helper.viewSlideIn,
  onbeforeremove: helper.viewSlideOut,
  view
};
