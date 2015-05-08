/** @jsx m */
import utils from '../../utils';
import widgets from '../widget/common';
import perf from '../widget/perf';
import layout from '../layout';
import menu from '../menu';
import i18n from '../../i18n';
import countries from './countries';
import helper from '../helper';
const moment = window.moment;

function renderProfile(user) {
  if (user.profile) {
    const fullname = (user.profile.firstName || user.profile.lastName) ?
      user.profile.firstName + ' ' + user.profile.lastName :
      null;
    const country = countries[user.profile.country];
    const location = user.profile.location;
    var locationString = '';
    if (location) locationString += location;
    if (country) locationString += (location ? ', ' : '') + country;
    const memberSince = i18n('memberSince') + ' ' + moment(user.createdAt).format('LL');
    const seenAt = user.seenAt ? i18n('lastLogin') + ' ' + moment(user.seenAt).format('LLL') : null;
    return (
      <div className="profile">
        {fullname ?
        <h3 className="fullname">{fullname}</h3> : null
        }
        {user.profile.bio ?
        <p className="profileBio">{user.profile.bio}</p> : null
        }
        <div className="userInfos">
          <p className="location">{locationString}</p>
          <p className="memberSince">{memberSince}</p>
          {seenAt ?
          <p className="lastSeen">{seenAt}</p> : null
          }
        </div>
      </div>
    );
  } else
    return null;
}

function renderStats(user) {
  const totalPlayTime = user.playTime ? 'Time spent playing: ' + moment.duration(user.playTime.total, 'seconds').humanize() : null;
  const tvTime = user.playTime && user.playTime.tv > 0 ? 'Time on TV: ' + moment.duration(user.playTime.tv, 'seconds').humanize() : null;

  return (
    <div className="userStats">
      {totalPlayTime ?
      <p className="playTime">{totalPlayTime}</p> : null
      }
      {tvTime ?
      <p className="onTv">{tvTime}</p> : null
      }
    </div>
  );
}

const perfTypes = [
  ['bullet', 'Bullet'],
  ['chess960', 'Chess960'],
  ['blitz', 'Blitz'],
  ['kingOfTheHill', 'King Of The Hill'],
  ['classical', 'Classical'],
  ['threeCheck', 'Three-check'],
  ['correspondence', 'Correspondence'],
  ['antichess', 'Antichess'],
  ['atomic', 'Atomic']
];

function userPerfs(user) {
  var res = perfTypes.map(function(p) {
    if (perf) return {
      key: p[0],
      name: p[1],
      perf: user.perfs[p[0]]
    };
  }).sort(function(a, b) {
    return a.perf.games < b.perf.games;
  });
  if (user.perfs.puzzle) res.push({
    key: 'puzzle',
    name: 'Training',
    perf: user.perfs.puzzle
  });

  return res;
}

function renderRatings(user) {
  return (
    <section className="ratings">
      {userPerfs(user).map(p => perf(p.key, p.name, p.perf))}
    </section>
  );
}

function renderActions(ctrl) {
  const user = ctrl.user();
  return (
    <section id="userProfileActions">
      {user.followable && !ctrl.isMe() ?
      <div className="list_item">
        <div className="check_container">
          <label forHtml="following">{i18n('following')}</label>
          <input id="user_following" type="checkbox" checked={user.following}
            onchange={ctrl.toggleFollowing} />
        </div>
      </div> : null
      }
      <div
        className="list_item nav"
        config={helper.ontouchendScrollY(utils.f(m.route, `/@/${user.id}/games`))}
      >
        {i18n('viewAllNbGames', user.count.game)}
      </div>
      <div className="list_item">
        <button className="profileButton">
          <span data-icon="U" />
          {i18n('challengeToPlay')}
        </button>
      </div>
    </section>
  );
}

export default function(ctrl) {
  const user = ctrl.user();
  console.log(user);
  const header = utils.partialf(widgets.header, null,
    widgets.backButton(user.username)
  );

  function profile() {
    return (
      <div className="native_scroller">
        {renderProfile(user)}
        {renderStats(user)}
        {renderRatings(user)}
        {renderActions(ctrl)}
      </div>
    );
  }

  return layout.free(header, profile, widgets.empty, menu.view, widgets.empty);
};
