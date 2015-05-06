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
      '';
    const country = countries[user.profile.country];
    const location = user.profile.location;
    var locationString = '';
    if (location) locationString += location;
    if (country) locationString += (location ? ', ' : '') + country;

    return (
      <div className="profile">
        <h3 className="fullname">{fullname}</h3>
        <br/>
        <p className="bio"><em>{user.profile.bio}</em></p>
        <br/>
        <p className="location">{locationString}</p>
      </div>
    );
  } else
    return null;
}

function renderHeader(user) {
  const memberSince = i18n('memberSince') + ' ' + moment(user.createdAt).format('LL');
  const seenAt = user.seenAt ? i18n('lastLogin') + ' ' + moment(user.seenAt).format('LLL') : null;
  const totalPlayTime = user.playTime ? 'Time spent playing: ' + moment.duration(user.playTime.total, 'seconds').humanize() : null;
  const tvTime = user.playTime && user.playTime.tv > 0 ? 'Time on TV: ' + moment.duration(user.playTime.tv, 'seconds').humanize() : null;

  return (
    <header className="user_profile_header">
      <div className="userInfos">
        {renderProfile(user)}
        <p className="memberSince">{memberSince}</p>
        {seenAt ?
        <p className="lastSeen">{seenAt}</p> : null
        }
        <br/>
        {totalPlayTime ?
        <p className="playTime">{totalPlayTime}</p> : null
        }
        {tvTime ?
        <p className="onTv">{tvTime}</p> : null
        }
      </div>
    </header>
  );
}

function renderRatings(user) {
  return utils.userPerfs(user).map(p => {
    return perf(p.key, p.name, p.perf);
  });
}

function renderActions(user) {
  return (
    <section id="userProfileActions">
      <button className="profileButton" config={helper.ontouchendScrollY(() => {
        m.route('/@/' + user.username + '/games');
      })}>
        { `See ${user.username}'s games`}
      </button>
    </section>
  );
}

export default function(ctrl) {
  const user = ctrl.getUserData();
  console.log(user);
  const header = utils.partialf(widgets.header, null,
    widgets.backButton(user.username)
  );

  function profile() {
    return (
      <div className="native_scroller">
        <div id="user_profile">
          {renderHeader(user)}
          <section className="ratings profile">{renderRatings(user)}</section>
          <br/>
          <br/>
          {renderActions(user)}
        </div>
      </div>
    );
  }

  return layout.free(header, profile, widgets.empty, menu.view, widgets.empty);
};
