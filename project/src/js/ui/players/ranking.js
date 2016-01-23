import socket from '../../socket';
import * as utils from '../../utils';
import h from '../helper';
import * as xhr from './playerXhr';
import layout from '../layout';
import { userStatus, header, empty } from '../shared/common';
import i18n from '../../i18n';
import { perfTitle } from '../../lichess/perfs';
import helper from '../helper';
import m from 'mithril';

export default {
  controller() {

    helper.analyticsTrackView('Leaderboard');

    socket.createDefault();

    const ranking = m.prop({});

    xhr.ranking().then(data => {
      Object.keys(data).forEach(k => {
        data[k].isOpenedOnMobile = false;
      });
      ranking(data);
    }, err => {
      utils.handleXhrError(err);
      m.route('/');
    });

    return {
      ranking,
      toggleRankingCat(key) {
        let cat = ranking()[key];
        cat.isOpenedOnMobile = !cat.isOpenedOnMobile;
      }
    };
  },

  view(ctrl) {
    return layout.free(
      () => header(i18n('leaderboard')),
      renderBody.bind(undefined, ctrl),
      empty,
      empty
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
  const toggleDataIcon = ranking[key].isOpenedOnMobile ? 'S' : 'R';
  const toggleFunc = h.isWideScreen() ? utils.noop : ctrl.toggleRankingCat.bind(undefined, key);
  return (
    <section className={'ranking ' + key}>
      <h3 className="rankingPerfTitle" config={h.ontouchY(toggleFunc)}>
        <span className="perfIcon" data-icon={utils.gameIcon(key)} />
        {perfTitle(key)}
        {h.isWideScreen() ? null : <span className="toggleIcon" data-icon={toggleDataIcon} />}
      </h3>
      {ranking[key].isOpenedOnMobile || h.isWideScreen() ?
      <ul className="rankingList">
        {ranking[key].map(p => renderRankingPlayer(p, key))}
      </ul> : null
      }
    </section>
  );
}

function renderRankingPlayer(user, key) {
  return (
    <li className="rankingPlayer" config={h.ontouchY(() => m.route('/@/' + user.id))}>
      {userStatus(user)}
      <span className="rating">
        {user.perfs[key].rating}
      </span>
    </li>
  );
}
