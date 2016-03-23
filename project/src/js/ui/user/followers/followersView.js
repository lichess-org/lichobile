import { header } from '../../shared/common';
import { renderPlayer } from '../following/followingView';
import layout from '../../layout';

export default function view(ctrl) {

  return layout.free(
    header.bind(undefined, 'Followers'),
    renderBody.bind(undefined, ctrl)
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
