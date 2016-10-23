import { throttle } from 'lodash/function';
import redraw from '../../../utils/redraw';
import router from '../../../router';
import * as utils from '../../../utils';
import * as xhr from '../tournamentXhr';
import * as helper from '../../helper';
import * as m from 'mithril';
import faq from '../faq';
import playerInfo from '../playerInfo';

export default function oninit(vnode) {
  helper.analyticsTrackView('Tournament create');

  vnode.state = {
  };
}
