import * as utils from '../../utils';
import router from '../../router';
import * as h from '../helper';
import { menuButton, friendsButton, userStatus } from '../shared/common';
import { backArrow } from '../shared/icons';
import layout from '../layout';
import settings from '../../settings';
import i18n from '../../i18n';

export default function view(vnode) {
  const ctrl = vnode.state;
  const headerCtrl = header.bind(undefined, ctrl);
  const bodyCtrl = body.bind(undefined, ctrl);
  const searchModalCtrl = searchModal.bind(undefined, ctrl);

  return layout.free(headerCtrl, bodyCtrl, null, searchModalCtrl);
}

function header(ctrl) {
  return [
    <nav>
      {menuButton()}
      <div className="main_header_title">{i18n('players')}</div>
      <div className="buttons">
        {friendsButton()}
        <button className="main_header_button" key="searchPlayers" data-icon="y"
          oncreate={h.ontap(ctrl.goSearch)}/>
      </div>
    </nav>,
    <div className="main_header_drop_shadow" />
  ];
}

function searchModal(ctrl) {
  if (!ctrl.isSearchOpen())
    return null;

  const className = [
    'modal',
    'show',
    settings.general.theme.background()
  ].join(' ');

  return (
    <div id="searchPlayersModal" className={className}>
      <header class="main_header">
        <button className="main_header_button" oncreate={h.ontap(ctrl.closeSearch)}>
          {backArrow}
        </button>
        <div className="search_input allow_select">
          <input id="searchPlayers" type="search"
          placeholder="Search players" oninput={ctrl.onInput}
          autocapitalize="off"
          autocomplete="off"
          oncreate={h.autofocus}
          />
        </div>
        <div className="main_header_drop_shadow" />
      </header>
      <ul id="playersSearchResults" className="modal_content native_scroller">
      {ctrl.searchResults().map(u => {
        return (
          <li className="list_item nav" key={u} oncreate={h.ontapY(utils.f(ctrl.goToProfile, u))}>
          {u}
          </li>
        );
      })}
      </ul>
    </div>
  );
}

function body(ctrl) {
  return (
    <ul className="playersSuggestion native_scroller page">
      {ctrl.players().map(renderPlayer)}
    </ul>
  );
}

function renderPlayer(user) {
  const perf = Object.keys(user.perfs).reduce((prev, curr) => {
    if (!prev) return curr;
    if (curr === 'opening' || curr === 'puzzle') return prev;
    if (user.perfs[prev].rating < user.perfs[curr].rating)
      return curr;
    else
      return prev;
  });
  return (
    <li className="list_item playerSuggestion nav" oncreate={h.ontapY(() => router.set('/@/' + user.id))}>
      {userStatus(user)}
      <span className="rating" data-icon={utils.gameIcon(perf)}>
        {user.perfs[perf].rating}
      </span>
    </li>
  );
}
