import { empty, header } from '../../shared/common';
import layout from '../../layout';
import i18n from '../../../i18n';

export default function view(ctrl) {

  return layout.free(
    header.bind(undefined, i18n('following')),
    renderBody.bind(undefined, ctrl),
    empty,
    empty
  );
}

function renderBody(ctrl) {
  return (
    <ul className="playersSuggestion native_scroller page">
      {ctrl.following().map(renderPlayer)}
    </ul>
  );
}

function renderPlayer(obj) {
  return (
    <li className="list_item playerSuggestion">
      {obj.user}
    </li>
  );
}
