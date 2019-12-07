import h from 'mithril/hyperscript'
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
        {rel.map((p, i) => renderPlayer(ctrl, p, i))}
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

function renderPlayer(ctrl: IRelationCtrl, obj: Related, i: number) {
  const status = obj.online ? 'online' : 'offline'
  const perfKey = obj.perfs && Object.keys(obj.perfs)[0] as PerfKey
  const perf = obj.perfs && obj.perfs[perfKey]
  const userLink = helper.ontapY(() => router.set(`/@/${obj.user}`))
  const evenOrOdd = i % 2 === 0 ? 'even' : 'odd'
  return (
    <li className={`list_item followingList ${evenOrOdd}`}>
      <div className="followingPlayerTitle" oncreate={userLink}>
        <div className="user">
          {obj.patron ?
            <span className={'patron userStatus ' + status} data-icon="" /> :
            <span className={'fa fa-circle userStatus ' + status} />
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
            <label>{i18n('follow')}</label>
            <input type="checkbox" checked={obj.relation}
              onchange={() => ctrl.toggleFollowing(obj)} />
          </div>
        </div> : null
      }
    </li>
  )

}
