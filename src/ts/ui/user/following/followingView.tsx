import router from '../../../router'
import { gameIcon } from '../../../utils'
import * as helper from '../../helper'
import i18n from '../../../i18n'

import { IRelationCtrl } from './followingCtrl'
import { Related } from '../../../lichess/interfaces/user'

export function renderBody(ctrl: IRelationCtrl) {
  if (ctrl.related().length) {
    const paginator = ctrl.paginator()
    const nextPage = paginator && paginator.nextPage
    return (
      <ul className="native_scroller page">
        {ctrl.related().map(p => renderPlayer(ctrl, p))}
        {nextPage ?
          <li className="list_item followingList moreFollow" oncreate={helper.ontapY(() => ctrl.loadNextPage(nextPage))}> ... </li> :
          null
        }
      </ul>
    )
  } else {
    return (
      <div className="followingListEmpty">
        Oops! Nothing here.
      </div>
    )
  }
}

export function renderPlayer(ctrl: IRelationCtrl, obj: Related) {
  const status = obj.online ? 'online' : 'offline'
  const perfKey = obj.perfs && Object.keys(obj.perfs)[0]
  const perf = obj.perfs && obj.perfs[perfKey]
  const userLink = helper.ontapY(() => router.set(`/@/${obj.user}`))
  return (
    <li className="list_item followingList">
      <div className="followingPlayerTitle" oncreate={userLink}>
        <div className="user">
          {obj.patron ?
            <span className={'patron userStatus ' + status} data-icon="" /> :
            <span className={'userStatus ' + status} data-icon="r" />
          }
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
              onchange={() => ctrl.toggleFollowing(obj)} />
          </div>
        </div> : null
      }
      <button className="followingPlayerItem followingPlayerAction withIcon" data-icon="U"
        oncreate={helper.ontapY(() => ctrl.challenge(obj.user))}
      >
        {i18n('challengeToPlay')}
      </button>
    </li>
  )

}
