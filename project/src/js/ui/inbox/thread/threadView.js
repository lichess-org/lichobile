import * as h from '../../helper';
import router from '../../../router';
import { header as headerWidget, backButton } from '../../shared/common';
import layout from '../../layout';
import i18n from '../../../i18n';
import * as m from 'mithril';

export default function view(vnode) {
  const ctrl = vnode.state;
  const headerCtrl = () => headerWidget(null,
    backButton(ctrl.thread() ? ctrl.thread().name : null)
  );
  const bodyCtrl = threadBody.bind(undefined, ctrl);

  return layout.free(headerCtrl, bodyCtrl);
}

function threadBody(ctrl) {
  if (!ctrl.thread()) return null;

  return (
    <div className="threadWrapper native_scroller">

    </div>
  );
}
