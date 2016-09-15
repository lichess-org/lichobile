import {header } from '../shared/common';
import layout from '../layout';
import i18n from '../../i18n';
import * as m from 'mithril';

export default function view(vnode) {
  const ctrl = vnode.state;
  const bodyCtrl = tournamentListBody.bind(undefined, ctrl);

  return layout.free(header.bind(undefined, i18n('tournaments')), bodyCtrl);
}


function tournamentListBody(ctrl) {
  return (null);
}
