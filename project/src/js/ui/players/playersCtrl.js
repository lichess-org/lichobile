import socket from '../../socket';
import backbutton from '../../backbutton';
import throttle from 'lodash/throttle';
import * as utils from '../../utils';
import * as xhr from './playerXhr';
import helper from '../helper';
import m from 'mithril';

export default function controller() {
  socket.createDefault();

  helper.analyticsTrackView('Players');

  const isSearchOpen = m.prop(false);
  const searchResults = m.prop([]);
  const players = m.prop([]);
  let listHeight;

  function onKeyboardShow(e) {
    if (window.cordova.platformId === 'ios') {
      let ul = document.getElementById('players_search_results');
      if (ul) {
        listHeight = ul.offsetHeight;
        ul.style.height = (listHeight - e.keyboardHeight) + 'px';
      }
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

  xhr.onlinePlayers().then(players, err => utils.handleXhrError(err));

  return {
    players,
    isSearchOpen,
    searchResults,
    onInput: throttle(e => {
      const term = e.target.value.trim();
      if (term.length > 1)
        xhr.autocomplete(term).then(data => searchResults(data));
    }, 250),
    closeSearch,
    goSearch() {
      helper.analyticsTrackView('Player search');
      backbutton.stack.push(closeSearch);
      isSearchOpen(true);
    },
    goToProfile(u) {
      m.route('/@/' + u);
    },
    onunload: () => {
      window.removeEventListener('native.keyboardshow', onKeyboardShow);
      window.removeEventListener('native.keyboardhide', onKeyboardHide);
    }
  };
}
