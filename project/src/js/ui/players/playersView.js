import * as utils from '../../utils';
import router from '../../router';
import h from '../helper';
import { menuButton, friendsButton, userStatus } from '../shared/common';
import layout from '../layout';
import settings from '../../settings';
import i18n from '../../i18n';
import * as m from 'mithril';

export default function view(vnode) {
  const ctrl = vnode.state;
  const headerCtrl = header.bind(undefined, ctrl);
  const bodyCtrl = body.bind(undefined, ctrl);
  const searchModalCtrl = searchModal.bind(undefined, ctrl);

  return layout.free(headerCtrl, bodyCtrl, null, searchModalCtrl);
}

function header(ctrl) {
  return (
    <nav>
      {menuButton()}
      <h1>{i18n('players')}</h1>
      <div className="buttons">
        {friendsButton()}
        <button className="main_header_button" key="searchPlayers" data-icon="y"
          oncreate={h.ontouch(ctrl.goSearch)}/>
      </div>
    </nav>
  );
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
      <header>
        <button key="search-players-backbutton" className="fa fa-arrow-left search_back" oncreate={h.ontouch(ctrl.closeSearch)} />
        <div className="search_input allow_select">
          <input id="searchPlayers" type="search"
          placeholder="Search players" oninput={ctrl.onInput}
          autocapitalize="off"
          autocomplete="off"
          oncreate={h.autofocus}
          />
        </div>
      </header>
      <ul id="playersSearchResults" className="modal_content native_scroller">
      {ctrl.searchResults().map(u => {
        return (
          <li className="list_item nav" key={u} oncreate={h.ontouchY(utils.f(ctrl.goToProfile, u))}>
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
    <li className="list_item playerSuggestion nav" oncreate={h.ontouchY(() => router.set('/@/' + user.id))}>
      {userStatus(user)}
      <span className="rating" data-icon={utils.gameIcon(perf)}>
        {user.perfs[perf].rating}
      </span>
    </li>
  );
}
