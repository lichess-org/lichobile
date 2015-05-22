/** @jsx m */
import utils from '../../utils';
import h from '../helper';
import widgets from '../widget/common';
import layout from '../layout';
import * as xhr from './playerXhr';
import socket from '../../socket';
import throttle from 'lodash/function/throttle';

export default {
  controller() {
    socket.createDefault();
    const list = m.prop([]);
    let listHeight;

    function onKeyboardShow(e) {
      if (window.cordova.platformId === 'ios') {
        let ul = document.getElementById('players_search_results');
        if (!ul) return;
        if (!listHeight)
          listHeight = ul.offsetHeight;
        ul.style.height = (listHeight - e.keyboardHeight) + 'px';
      }
    }

    function onKeyboardHide() {
      if (window.cordova.platformId === 'ios') {
        let ul = document.getElementById('players_search_results');
        if (!ul) return;
        ul.style.height = listHeight + 'px';
      }
    }

    window.addEventListener('native.keyboardshow', onKeyboardShow);
    window.addEventListener('native.keyboardhide', onKeyboardHide);

    return {
      list,
      onInput: throttle(e => {
        const term = e.target.value.trim();
        if (term.length > 1)
          xhr.autocomplete(term).then(data => list(data));
      }, 250),
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
      return (
        <nav>
          {widgets.menuButton()}
          {widgets.gameButton()}
          <div className="search_input">
            <span className="fa fa-search icon"/>
            <input id="searchPlayers" type="search"
              placeholder="Search players" oninput={ctrl.onInput}
              autocapitalize="off"
              autocomplete="off"
            />
          </div>
        </nav>
      );
    }

    function body() {
      return (
        <ul id="players_search_results" className="native_scroller search_results">
          {ctrl.list().map(u => {
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
