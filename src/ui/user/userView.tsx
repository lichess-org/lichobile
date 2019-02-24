import * as h from 'mithril/hyperscript'
import router from '../../router'
import { dropShadowHeader, backButton as renderBackbutton } from '../shared/common'
import { getLanguageNativeName } from '../../utils/langs'
import { hasNetwork, lichessAssetSrc, gameIcon } from '../../utils'
import { perfTypes, provisionalDeviation } from '../../lichess/perfs'
import { Perf } from '../../lichess/interfaces/user'
import * as xhr from '../../xhr'
import i18n from '../../i18n'
import countries from '../../utils/countries'
import * as helper from '../helper'
import session from '../../session'
import { IUserCtrl, ProfileUser, isSessionUser, isFullUser } from './UserCtrl'

export function header(user: ProfileUser, ctrl: IUserCtrl) {
  const status = hasNetwork() && user.online ? 'online' : 'offline'
  const icon = user.patron ?
    <span className={'userStatus patron ' + status} data-icon="" /> :
    <span className={'fa fa-circle userStatus ' + status} />

  const title = h('div.title', [
    icon,
    h('span', [
      ...(user.title ? [h('span.userTitle', user.title), ' '] : []),
      user.username
    ])
  ])

  const backButton = !ctrl.isMe() ? renderBackbutton(title) : null
  return dropShadowHeader(backButton ? null : title, backButton)
}

export function profile(user: ProfileUser, ctrl: IUserCtrl) {
  return (
    <div id="userProfile" className="native_scroller page">
      {renderWarnings(user)}
      {renderProfile(user)}
      {renderStats(user)}
      {renderPatron(user)}
      {renderRatings(user)}
      {renderActions(ctrl, user)}
    </div>
  )
}

function renderWarnings(user: ProfileUser) {
  if (!user.engine && !user.booster) return null

  return (
    <section className="warnings">
      {user.engine ?
      <div className="warning" data-icon="j">{i18n('thisPlayerUsesChessComputerAssistance')}</div> : null
      }
      {user.booster ?
      <div className="warning" data-icon="j">{i18n('thisPlayerArtificiallyIncreasesTheirRating')}</div> : null
      }
    </section>
  )
}

function renderProfile(user: ProfileUser) {
  if (user.profile) {
    let fullname = ''
    if (user.profile.firstName) fullname += user.profile.firstName
    if (user.profile.lastName) fullname += (user.profile.firstName ? ' ' : '') + user.profile.lastName
    const country = countries[user.profile.country]
    const location = user.profile.location
    const memberSince = i18n('memberSince') + ' ' + window.moment(user.createdAt).format('LL')
    const seenAt = user.seenAt ? 'Last login ' + window.moment(user.seenAt).calendar() : null
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
            {country && hasNetwork() ?
            <span className="country">
              {location ? ',' : ''} <img className="flag" src={lichessAssetSrc('images/flags/' + user.profile.country + '.png')} />
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
    )
  } else
    return null
}

function renderPatron(user: ProfileUser) {
  if (user.patron)
    return (
      <p className="user-patron"
        oncreate={helper.ontapY(xhr.openWebsitePatronPage)}
      >
        <span className="userStatus patron" data-icon="" />
        Lichess Patron
        <span className="fa fa-external-link" />
      </p>
    )
  else
    return null
}

function renderStats(user: ProfileUser) {
  let totalPlayTime: string | null = null
  let tvTime: string | null = null

  if (isFullUser(user)) {
    totalPlayTime = user.playTime ? 'Time spent playing: ' + window.moment.duration(user.playTime.total, 'seconds').humanize() : null
    tvTime = user.playTime && user.playTime.tv > 0 ? 'Time on TV: ' + window.moment.duration(user.playTime.tv, 'seconds').humanize() : null
  } else if (isSessionUser(user)) {
    totalPlayTime = user.playTime ? 'Time spent playing: ' + window.moment.duration(user.playTime, 'seconds').humanize() : null
  }

  return (
    <section className="userStats">
      {totalPlayTime ?
      <p className="playTime">{totalPlayTime}</p> : null
      }
      {tvTime ?
      <p className="onTv">{tvTime}</p> : null
      }
    </section>
  )
}

function userPerfs(user: ProfileUser) {
  const res = perfTypes.map(p => {
    const perf = user.perfs[p[0]]
    return {
      key: p[0] as PerfKey,
      name: p[1],
      perf: perf || '-'
    }
  })

  if (user.perfs.puzzle) res.push({
    key: 'puzzle',
    name: 'Training',
    perf: user.perfs.puzzle
  })

  return res
}

function variantPerfAvailable(key: PerfKey, perf: Perf) {
  return (key !== 'puzzle' && perf.games > 0)
}

function renderPerf(key: PerfKey, name: string, perf: Perf, user: ProfileUser) {

  const avail = variantPerfAvailable(key, perf)
  
  const props = {
    className: 'profilePerf' + (avail ? ' nav' : ''),
    'data-icon': gameIcon(key),
    oncreate: avail ? helper.ontapY(() => {
      if (hasNetwork()) router.set(`/@/${user.id}/${key}/perf`)
    }) : null
  }

  return h('div', props, [
    h('span.name', name),
    h('div.rating', [
      perf.rating,
      perf.rd >= provisionalDeviation ? '?' : null,
      helper.progress(perf.prog),
      h('span.nb', '/ ' + perf.games)
    ])
  ])
}


function renderRatings(user: ProfileUser) {
  function isShowing(p: { key: string, perf: { games: number }}) {
    return [
      'blitz', 'bullet', 'rapid', 'classical', 'correspondence'
    ].indexOf(p.key) !== -1 || p.perf.games > 0
  }

  return (
    <section id="userProfileRatings" className="perfs">
      {userPerfs(user).filter(isShowing).map(p => renderPerf(p.key, p.name, p.perf, user))}
    </section>
  )
}

function renderActions(ctrl: IUserCtrl, user: ProfileUser) {
  return (
    <section id="userProfileActions" className="items_list_block noPadding">
      { isFullUser(user) ?
        <div className="list_item nav"
          oncreate={helper.ontapY(ctrl.goToGames)}
          key="view_all_games"
        >
          {i18n('viewAllNbGames', user.count.all)}
        </div> : null
      }
      { session.isConnected() && !ctrl.isMe() ?
      <div className="list_item" key="challenge_to_play" data-icon="U"
        oncreate={helper.ontapY(ctrl.challenge)}
      >
        {i18n('challengeToPlay')}
      </div> : null
      }
      { !ctrl.isMe() ? <div className="list_item nav" data-icon="1"
        oncreate={helper.ontapY(ctrl.goToUserTV)}
        key="user_tv"
      >
        {i18n('watchGames')}
      </div> : null
      }
      { session.isConnected() && !ctrl.isMe() ?
      <div className="list_item nav" key="compose_message" data-icon="m"
        oncreate={helper.ontapY(ctrl.composeMessage)}
      >
        {i18n('composeMessage')}
      </div> : null
      }
      {session.isConnected() && isFullUser(user) && user.followable && !ctrl.isMe() ?
      <div className={['list_item', user.blocking ? 'disabled' : ''].join(' ')} key="user_following">
        <div className="check_container">
          <label htmlFor="user_following">{i18n('follow')}</label>
          <input id="user_following" type="checkbox" checked={user.following}
            disabled={user.blocking}
            onchange={ctrl.toggleFollowing} />
        </div>
      </div> : null
      }
      {session.isConnected() && isFullUser(user) && !ctrl.isMe() ?
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
  )
}
