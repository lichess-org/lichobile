/** @jsx m */
import socket from '../../socket';
import utils from '../../utils';
import * as xhr from './playerXhr';
import layout from '../layout';
import widgets from '../widget/common';
import i18n from '../../i18n';

export default {
  controller() {
    socket.createDefault();

    const ranking = m.prop({});

    xhr.ranking().then(ranking, err => {
      utils.handleXhrError(err);
      m.route('/');
    });

    return {
      ranking,
      onunload: () => {
        socket.destroy();
      }
    };
  },

  view(ctrl) {
    return layout.free(
      () => widgets.header(i18n('ranking')),
      renderBody.bind(undefined, ctrl),
      widgets.empty,
      widgets.empty
    );
  }
};

function renderBody(ctrl) {
  return (
    <div id="allRanking" className="native_scroller page">
      {Object.keys(ctrl.ranking()).filter(k => k !== 'online').map(k => renderRankingCategory(ctrl, k))}
    </div>
  );
}

function renderRankingCategory(ctrl, key) {
  const ranking = ctrl.ranking();
  return (
    <section className={'ranking ' + key}>
      <h3 className="rankingPerfTitle" data-icon={utils.gameIcon(key)}>{key}</h3>
      <ul>
        {ranking[key].map(p => renderRankingPlayer(p, key))}
      </ul>
    </section>
  );
}

function renderRankingPlayer(user, key) {
  return (
    <li className="rankingPlayer list_item">
      {widgets.userStatus(user)}
      <span className="rating">
        {user.perfs[key].rating}
      </span>
    </li>
  );
}
