import * as xhr from '../inboxXhr';
import * as helper from '../../helper';
import * as m from 'mithril';

export default function oninit(vnode) {
  helper.analyticsTrackView('Message details');
  vnode.state = { };
}
