import socket from '../../socket';
import backbutton from '../../backbutton';
import throttle from 'lodash/function/throttle';
import session from '../../session';
import utils from '../../utils';
import * as xhr from './playerXhr';

export default function controller() {
  socket.createDefault();

  const isSearchOpen = m.prop(false);
  const searchResults = m.prop([]);
  const players = m.prop([]);
  const suggestions = m.prop([]);
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
      if (ul) ul.style.height = listHeight + 'px';
    }
    let input = document.getElementById('searchPlayers');
    if (input) input.blur();
  }

  function closeSearch(fromBB) {
    if (fromBB !== 'backbutton' && isSearchOpen()) backbutton.stack.pop();
    isSearchOpen(false);
  }

  window.addEventListener('native.keyboardshow', onKeyboardShow);
  window.addEventListener('native.keyboardhide', onKeyboardHide);

  if (session.isConnected())
    xhr.suggestions(session.get().id).then(
      data => suggestions(data.suggested),
      err => utils.handleXhrError(err)
    );
  else
    xhr.onlinePlayers().then(players, err => utils.handleXhrError(err));

  return {
    players,
    suggestions,
    isSearchOpen,
    searchResults,
    onInput: throttle(e => {
      const term = e.target.value.trim();
      if (term.length > 1)
        xhr.autocomplete(term).then(data => searchResults(data));
    }, 250),
    closeSearch,
    goSearch() {
      backbutton.stack.push(closeSearch);
      isSearchOpen(true);
    },
    goToProfile(u) {
      m.route('/@/' + u);
    },
    onunload: () => {
      socket.destroy();
      window.removeEventListener('native.keyboardshow', onKeyboardShow);
      window.removeEventListener('native.keyboardhide', onKeyboardHide);
    }
  };
}
