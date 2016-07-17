import userPerfs from '../../lichess/perfs';
import { header as headerWidget, backButton as renderBackbutton } from '../shared/common';
import { getLanguageNativeName } from '../../utils/langs';
import perf from '../shared/perf';
import layout from '../layout';
import i18n from '../../i18n';
import countries from '../../utils/countries';
import helper from '../helper';
import session from '../../session';

export default function view() {
  const ctrl = this;
  const user = ctrl.user();

  if (!user) return null;

  function header() {
    const title = (user.title ? `${user.title} ` : '') + user.username;
    const backButton = !ctrl.isMe() ? renderBackbutton(title) : null;
    return headerWidget(backButton ? null : title, backButton);
  }

  function profile() {
    return (
      <div id="userProfile" className="native_scroller page">
        {renderStatus(user)}
        {renderWarnings(user)}
        {renderProfile(user)}
        {renderStats(user)}
        {renderRatings(user)}
        {renderActions(ctrl)}
      </div>
    );
  }

  return layout.free(header, profile);
}

function renderWarnings(user) {
  if (!user.engine && !user.booster) return null;

  return (
    <section className="warnings">
      {user.engine ?
      <div className="warning" data-icon="j">{i18n('thisPlayerUsesChessComputerAssistance')}</div> : null
      }
      {user.booster ?
      <div className="warning" data-icon="j">{i18n('thisPlayerArtificiallyIncreasesTheirRating')}</div> : null
      }
    </section>
  );
}

function renderStatus(user) {
  const status = user.online ? 'online' : 'offline';
  return (
    <section className="onlineStatus">
      <span className={'userStatus ' + status} data-icon="r" />
      {i18n(status)}
    </section>
  );
}

function renderProfile(user) {
  if (user.profile) {
    let fullname = '';
    if (user.profile.firstName) fullname += user.profile.firstName;
    if (user.profile.lastName) fullname += (user.profile.firstName ? ' ' : '') + user.profile.lastName;
    const country = countries[user.profile.country];
    const location = user.profile.location;
    const memberSince = i18n('memberSince') + ' ' + window.moment(user.createdAt).format('LL');
    const seenAt = user.seenAt ? i18n('lastLogin') + ' ' + window.moment(user.seenAt).calendar() : null;
    return (
      <section className="profile">
        {fullname ?
        <h3 className="fullname">{fullname}</h3> : null
        }
        {user.profile.bio ?
        <p className="profileBio">{user.profile.bio}</p> : null
        }
        <div className="userInfos">
          {
            user.language ?
              <p className="language withIcon">
                <span className="fa fa-comment-o" />
                {getLanguageNativeName(user.language)}
              </p> : null
          }
          <p className="location">
            {location}
            {country ?
            <span className="country">
              {location ? ',' : ''} <img className="flag" src={'images/flags/' + user.profile.country + '.png'} />
              {country}
            </span> : null
            }
          </p>
          <p className="memberSince">{memberSince}</p>
          {seenAt ?
          <p className="lastSeen">{seenAt}</p> : null
          }
        </div>
      </section>
    );
  } else
    return null;
}

function renderStats(user) {
  const totalPlayTime = user.playTime ? 'Time spent playing: ' + window.moment.duration(user.playTime.total, 'seconds').humanize() : null;
  const tvTime = user.playTime && user.playTime.tv > 0 ? 'Time on TV: ' + window.moment.duration(user.playTime.tv, 'seconds').humanize() : null;

  return (
    <section className="userStats">
      {totalPlayTime ?
      <p className="playTime">{totalPlayTime}</p> : null
      }
      {tvTime ?
      <p className="onTv">{tvTime}</p> : null
      }
    </section>
  );
}

function renderRatings(user) {
  function isShowing(p) {
    return [
      'blitz', 'bullet', 'classical', 'correspondence'
    ].indexOf(p.key) !== -1 || p.perf.games > 0;
  }

  return (
    <section id="userProfileRatings" className="perfs">
      {userPerfs(user).filter(isShowing).map(p => perf(p.key, p.name, p.perf, user))}
    </section>
  );
}

function renderActions(ctrl) {
  const user = ctrl.user();
  return (
    <section id="userProfileActions" class="noPadding">
      <div className="list_item nav"
        oncreate={helper.ontouchY(ctrl.goToGames)}
        key="view_all_games"
      >
        {i18n('viewAllNbGames', user.count.all)}
      </div>
      { session.isConnected() && !ctrl.isMe() ?
      <div className="list_item" key="challenge_to_play" data-icon="U"
        oncreate={helper.ontouchY(ctrl.challenge)}
      >
        {i18n('challengeToPlay')}
      </div> : null
      }
      <div className="list_item nav" data-icon="1"
        oncreate={helper.ontouchY(ctrl.goToUserTV)}
        key="user_tv"
      >
        {i18n('watchGames')}
      </div>
      {user.followable && !ctrl.isMe() ?
      <div className={['list_item', user.blocking ? 'disabled' : ''].join(' ')} key="user_following">
        <div className="check_container">
          <label htmlFor="user_following">{i18n('follow')}</label>
          <input id="user_following" type="checkbox" checked={user.following}
            disabled={user.blocking}
            onchange={ctrl.toggleFollowing} />
        </div>
      </div> : null
      }
      { session.isConnected() && !ctrl.isMe() ?
      <div className={['list_item', user.following ? 'disabled' : ''].join(' ')} key="user_blocking">
        <div className="check_container">
          <label htmlFor="user_blocking">{i18n('block')}</label>
          <input id="user_blocking" type="checkbox" checked={user.blocking}
            disabled={user.following}
            onchange={ctrl.toggleBlocking} />
        </div>
      </div> : null
      }
    </section>
  );
}
