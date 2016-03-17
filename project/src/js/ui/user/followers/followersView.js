import { empty, header } from '../../shared/common';
import { renderPlayer } from '../following/followingView';
import layout from '../../layout';
import i18n from '../../../i18n';

export default function view(ctrl) {

  return layout.free(
    header.bind(undefined, i18n('followers')),
    renderBody.bind(undefined, ctrl),
    empty,
    empty
  );
}

function renderBody(ctrl) {
  if (ctrl.followers().length) {
    return (
      <ul className="native_scroller page">
        {ctrl.followers().map(p => renderPlayer(ctrl, p))}
      </ul>
    );
  } else {
    return (
      <div className="followingListEmpty">
        Oops! Nothing here.
      </div>
    );
  }
}
