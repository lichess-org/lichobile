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
    const defaultSocket = socket.socket();
    const list = m.prop([]);

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
      onunload() {
        if (defaultSocket) defaultSocket.destroy();
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
            <input id="searchPlayers" type="search" placeholder="Search players" oninput={ctrl.onInput} />
          </div>
        </nav>
      );
    }

    function body() {
      return (
        <ul className="native_scroller search_results">
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
