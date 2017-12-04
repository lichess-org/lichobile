import router from '../../router'
import { gameIcon } from '../../utils'
import i18n from '../../i18n'
import spinner from '../../spinner'
import { Related } from '../../lichess/interfaces/user'
import * as helper from '../helper'
import { IRelationCtrl } from './interfaces'

export function renderBody(ctrl: IRelationCtrl) {
  const rel = ctrl.related()

  if (!rel) {
    return (
      <div className="followingListEmpty">
        {spinner.getVdom('monochrome')}
      </div>
    )
  }
  else if (rel.length) {
    const paginator = ctrl.paginator()
    const nextPage = paginator && paginator.nextPage
    return (
      <ul className="native_scroller page">
        {rel.map(p => renderPlayer(ctrl, p))}
        {nextPage ?
          <li
            className="list_item followingList moreFollow"
            oncreate={helper.ontapY(() => ctrl.loadNextPage(nextPage))}
          >
          {ctrl.isLoadingNextPage() ? spinner.getVdom('monochrome') : '...'}
          </li> : null
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

function renderPlayer(ctrl: IRelationCtrl, obj: Related) {
  const status = obj.online ? 'online' : 'offline'
  const perfKey = obj.perfs && Object.keys(obj.perfs)[0] as PerfKey
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
