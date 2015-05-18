/** @jsx m */
import utils from '../../utils';
import helper from '../helper';
import widgets from '../widget/common';
import layout from '../layout';
import * as xhr from './userXhr';
import gameApi from '../../lichess/game';
import i18n from '../../i18n';
import getVariant from '../../lichess/variant';
import gameStatus from '../../lichess/status';
import IScroll from 'iscroll/build/iscroll-probe';
import {throttle} from 'lodash/function';
import socket from '../../socket';
const moment = window.moment;

var scroller;

export default {
  controller: function() {
    socket.createDefault();
    const userId = m.route.param('id');
    var games = [];

    function onScroll() {
      console.log(this);
      if (this.y + this.distY <= this.maxScrollY) {
        console.log('loading next...');
        // TODO load next batch of games
      }
    }

    function scrollerConfig(el, isUpdate, context) {
      if (!isUpdate) {
        scroller = new IScroll(el, {
          probeType: 2
        });
        scroller.on('scroll', throttle(onScroll, 150));
        context.onunload = () => {
          if (scroller) {
            scroller.destroy();
            scroller = null;
          }
        };
      }
    }

    xhr.games(userId).then(data => {
      games = data.list;
    });

    return {
      getGames() { return games; },
      scrollerConfig,
      userId,
      onunload() {
        socket.destroy();
      }
    };
  },

  view: function(ctrl) {
    const header = utils.partialf(widgets.header, null,
      widgets.backButton(m.route.param('id') + ' games')
    );

    function renderAllGames() {
      return (
        <div className="scroller page" config={ctrl.scrollerConfig}>
          <ul className="userGames">
            { ctrl.getGames().map((g, i) => renderGame(g, i, ctrl.userId)) }
          </ul>
        </div>
      );
    }

    return layout.free(header, renderAllGames, widgets.empty, widgets.empty);
  }
};

function renderGame(g, index, userId) {
  const time = gameApi.time(g);
  const mode = g.rated ? i18n('rated') : i18n('casual');
  const title = time + ' • ' + getVariant(g.variant).name + ' • ' + mode;
  const date = moment(g.timestamp).calendar();
  const status = gameStatus.toLabel(g.status, g.winner, g.variant) +
    (g.winner ? '. ' + i18n(g.winner === 'white' ? 'whiteIsVictorious' : 'blackIsVictorious') + '.' : '');
  const userColor = g.players.white.userId === userId ? 'white' : 'black';
  const evenOrOdd = index % 2 === 0 ? 'even' : 'odd';

  return (
    <li className={`list_item userGame ${evenOrOdd}`}>
      <span className="iconGame" data-icon={utils.gameIcon(g.perf)} />
      <div className="infos">
        <div className="title">{title}</div>
        <small className="date">{date}</small>
        <div className="players">
          <div className="player white">
            <span className="playerName">{g.players.white.userId}</span>
            <br/>
            <small className="playerRating">{g.players.white.rating}</small>
          </div>
          <div className="swords" data-icon="U" />
          <div className="player black">
            <span className="playerName">{g.players.black.userId}</span>
            <br/>
            <small className="playerRating">{g.players.black.rating}</small>
          </div>
        </div>
        <div className={helper.classSet({
          status: true,
          win: userColor === g.winner,
          loose: g.winner && userColor !== g.winner
        })}>{status}</div>
      </div>
    </li>
  );
}
