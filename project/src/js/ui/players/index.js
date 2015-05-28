/** @jsx m */
import utils from '../../utils';
import h from '../helper';
import widgets from '../widget/common';
import layout from '../layout';
import i18n from '../../i18n';
import * as xhr from './playerXhr';
import socket from '../../socket';
import backbutton from '../../backbutton';
import throttle from 'lodash/function/throttle';

export default {
  controller() {
    socket.createDefault();

    const searchOpen = m.prop(false);
    const searchResults = m.prop([]);
    let listHeight;

    function onKeyboardShow(e) {
      if (window.cordova.platformId === 'ios') {
        let ul = document.getElementById('players_search_results');
        if (!listHeight) listHeight = ul.offsetHeight;
        if (ul) ul.style.height = (listHeight - e.keyboardHeight) + 'px';

      }
    }

    function onKeyboardHide() {
      if (window.cordova.platformId === 'ios') {
        let ul = document.getElementById('players_search_results');
        let input = document.getElementById('searchPlayers');
        if (ul) ul.style.height = listHeight + 'px';
        if (input) input.blur();
      }
    }

    window.addEventListener('native.keyboardshow', onKeyboardShow);
    window.addEventListener('native.keyboardhide', onKeyboardHide);

    function goSearch() {
      backbutton.stack.push(closeSearch);
      searchOpen(true);
    }

    function closeSearch(fromBB) {
      if (fromBB !== 'backbutton' && searchOpen()) backbutton.stack.pop();
      searchOpen(false);
    }

    return {
      searchOpen,
      searchResults,
      onInput: throttle(e => {
        const term = e.target.value.trim();
        if (term.length > 1)
          xhr.autocomplete(term).then(data => searchResults(data));
      }, 250),
      goSearch,
      closeSearch,
      goToProfile(u) {
        m.route('/@/' + u);
      },
      onunload: () => {
        socket.destroy();
        window.removeEventListener('native.keyboardshow', onKeyboardShow);
        window.removeEventListener('native.keyboardhide', onKeyboardHide);
      }
    };
  },

  view(ctrl) {
    function header() {
      if (ctrl.searchOpen())
        return (
          <nav className="search">
            <button key="search-players-backbutton" className="fa fa-arrow-left search_back" config={h.ontouch(ctrl.closeSearch)} />
            <div className="search_input">
              <input id="searchPlayers" type="search"
                placeholder="Search players" oninput={ctrl.onInput}
                autocapitalize="off"
                autocomplete="off"
                config={h.autofocus}
              />
            </div>
            <button className="fa fa-close clear_search" />
          </nav>
        );
      else
        return (
          <nav>
            {widgets.menuButton()}
            <h1>{i18n('players')}</h1>
            <button className="fa fa-search" config={h.ontouch(ctrl.goSearch)} />
          </nav>
        );
    }

    function body() {
      return (
        <ul id="players_search_results" className="native_scroller page search_results">
          {ctrl.searchResults().map(u => {
            return (
              <li className="list_item nav" key={u} config={h.ontouchY(utils.f(ctrl.goToProfile, u))}>
                {u}
              </li>
            );
          })}
        </ul>
      );
    }

    return layout.free(header, body, widgets.empty, widgets.empty);
  }
};
