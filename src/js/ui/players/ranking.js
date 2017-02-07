import socket from '../../socket';
import redraw from '../../utils/redraw';
import router from '../../router';
import * as utils from '../../utils';
import * as h from '../helper';
import * as xhr from './playerXhr';
import layout from '../layout';
import { userStatus, dropShadowHeader } from '../shared/common';
import i18n from '../../i18n';
import { perfTitle } from '../../lichess/perfs';
import * as helper from '../helper';
import * as stream from 'mithril/stream';

export default {
  oncreate: helper.viewFadeIn,

  oninit(vnode) {

    helper.analyticsTrackView('Leaderboard');

    socket.createDefault();

    const ranking = stream({});

    xhr.ranking()
    .then(data => {
      Object.keys(data).forEach(k => {
        data[k].isOpenedOnMobile = false;
      });
      ranking(data);
      redraw();
    })
    .catch(err => {
      utils.handleXhrError(err);
      router.set('/');
    });

    vnode.state = {
      ranking,
      toggleRankingCat(key) {
        let cat = ranking()[key];
        cat.isOpenedOnMobile = !cat.isOpenedOnMobile;
      }
    };
  },

  view(vnode) {
    const ctrl = vnode.state;

    return layout.free(
      () => dropShadowHeader(i18n('leaderboard')),
      renderBody.bind(undefined, ctrl)
    );
  }
};

function renderBody(ctrl) {
  const categories = Object.keys(ctrl.ranking())
    .filter(k => k !== 'online')
    .map(k => renderRankingCategory(ctrl, k));
  return (
    <div id="allRanking" className="native_scroller page">
      {categories}
    </div>
  );
}

function renderRankingCategory(ctrl, key) {
  const ranking = ctrl.ranking();
  const toggleDataIcon = ranking[key].isOpenedOnMobile ? 'S' : 'R';
  const toggleFunc = h.isWideScreen() ? utils.noop : ctrl.toggleRankingCat.bind(undefined, key);
  return (
    <section className={'ranking ' + key}>
      <h3 className="rankingPerfTitle" oncreate={h.ontapY(toggleFunc)}>
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
    <li className="rankingPlayer" oncreate={h.ontapY(() => router.set('/@/' + user.id))}>
      {userStatus(user)}
      <span className="rating">
        {user.perfs[key].rating}
      </span>
    </li>
  );
}
