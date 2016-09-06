import * as helper from '../helper';
import oninit from './tournamentCtrl';
import view from './tournamentView';

export default {
  oncreate: helper.viewFadeIn,
  onbeforeremove: helper.viewFadeOut,
  oninit,
  view
};
