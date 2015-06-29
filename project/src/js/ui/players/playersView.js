/** @jsx m */
import * as utils from '../../utils';
import h from '../helper';
import widgets from '../widget/common';
import layout from '../layout';
import i18n from '../../i18n';

export default function view(ctrl) {
  const headerCtrl = header.bind(undefined, ctrl);
  const bodyCtrl = body.bind(undefined, ctrl);
  const searchModalCtrl = searchModal.bind(undefined, ctrl);

  return layout.free(headerCtrl, bodyCtrl, widgets.empty, searchModalCtrl);
}

function header(ctrl) {
  return (
    <nav>
      {widgets.menuButton()}
      <h1>{i18n('players')}</h1>
      <div className="buttons">
        <button className="main_header_button" data-icon="y" config={h.ontouch(ctrl.goSearch)} />
        {widgets.friendsButton()}
      </div>
    </nav>
  );
}

function searchModal(ctrl) {
  if (!ctrl.isSearchOpen())
    return null;

  return (
    <div id="searchPlayersModal" className="modal show">
      <header>
        <button key="search-players-backbutton" className="fa fa-arrow-left search_back" config={h.ontouch(ctrl.closeSearch)} />
        <div className="search_input">
          <input id="searchPlayers" type="search"
          placeholder="Search players" oninput={ctrl.onInput}
          autocapitalize="off"
          autocomplete="off"
          config={h.autofocus}
          />
        </div>
      </header>
      <ul id="playersSearchResults" className="modal_content native_scroller">
      {ctrl.searchResults().map(u => {
        return (
          <li className="list_item nav" key={u} config={h.ontouchY(utils.f(ctrl.goToProfile, u))}>
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
    <li className="list_item playerSuggestion nav" config={h.ontouchY(() => m.route('/@/' + user.id))}>
      {widgets.userStatus(user)}
      <span className="rating" data-icon={utils.gameIcon(perf)}>
        {user.perfs[perf].rating}
      </span>
    </li>
  );
}
