/** @jsx m */
import layout from '../layout';
import { header } from '../widget/common';
import { view as renderPromotion } from '../otb/promotion';
import helper from '../helper';
import i18n from '../../i18n';
import { renderBoard } from '../round/view/roundView';

export default function view(ctrl) {
  return layout.board(
    header.bind(undefined, i18n('training')),
    renderContent.bind(undefined, ctrl),
    null
  );
}

function renderContent(ctrl) {
  if (helper.isPortrait())
    return (
      <div className = "content round">
        {renderBoard(ctrl, renderPromotion)}
      </div>
    );
  else
    return (
      <div className="content round">
        {renderBoard(ctrl, renderPromotion)}
        <section key="table" className="table">
        </section>
      </div>
    );
}
