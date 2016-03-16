import { empty, header } from '../../shared/common';
import { gameIcon } from '../../../utils';
import helper from '../../helper';
import layout from '../../layout';
import i18n from '../../../i18n';

export default function view(ctrl) {

  return layout.free(
    header.bind(undefined, i18n('following')),
    renderBody.bind(undefined, ctrl),
    empty,
    empty
  );
}

function renderBody(ctrl) {
  return (
    <ul className="playersSuggestion native_scroller page">
      {ctrl.following().map(p => renderPlayer(ctrl, p))}
    </ul>
  );
}

function renderPlayer(ctrl, obj) {
  const status = obj.online ? 'online' : 'offline';
  const perfKey = obj.perfs && Object.keys(obj.perfs)[0];
  const perf = obj.perfs && obj.perfs[perfKey];
  return (
    <li className="list_item followingList">
      <div className="followingPlayerTitle">
        <div className="user">
          <span className={'userStatus ' + status} data-icon="r" />
          {obj.title ? <span className="userTitle">{obj.title}&nbsp;</span> : null}
          {obj.user}
        </div>
        { perfKey ?
        <span className="rating" data-icon={gameIcon(perfKey)}>
          {perf.rating}
        </span> : null
        }
      </div>
      {obj.followable ?
        <div className="followingPlayerItem">
          <div className="check_container">
            <label htmlFor="user_following">{i18n('follow')}</label>
            <input id="user_following" type="checkbox" checked={obj.relation}
              onchange={ctrl.toggleFollowing} />
          </div>
        </div> : null
      }
      <div className="followingPlayerItem followingPlayerAction withIcon" data-icon="U"
        config={helper.ontouchY(ctrl.challenge)}
      >
        {i18n('challengeToPlay')}
      </div>
    </li>
  );

}
