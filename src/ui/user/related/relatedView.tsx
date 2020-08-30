import h from 'mithril/hyperscript'
import router from '../../../router'
import { gameIcon } from '../../../utils'
import i18n, { plural } from '../../../i18n'
import spinner from '../../../spinner'
import { Related } from '../../../lichess/interfaces/user'
import { Paginator } from '../../../lichess/interfaces'
import * as helper from '../../helper'
import TabNavigation from '../../shared/TabNavigation'
import TabView from '../../shared/TabView'

import RelatedCtrl from './RelatedCtrl'

export function renderBody(ctrl: RelatedCtrl) {
  const tabsContent = [
    { id: 'followers', f: () => renderContent(ctrl, ctrl.followers, ctrl.followersPaginator) },
    { id: 'following', f: () => renderContent(ctrl, ctrl.following, ctrl.followingPaginator) },
  ]

  const nbFollowers = ctrl.followersPaginator && ctrl.followersPaginator.nbResults
  const nbFollowing = ctrl.followingPaginator && ctrl.followingPaginator.nbResults

  return [
    h('div.tabs-nav-header.subHeader',
      h(TabNavigation, {
        buttons: [
          { label: plural('nbFollowers', nbFollowers || 0, nbFollowers ? undefined : '') },
          { label: plural('nbFollowing', nbFollowing || 0, nbFollowing ? undefined : '') },
        ],
        selectedIndex: ctrl.currentTab,
        onTabChange: ctrl.onTabChange
      }),
    ),
    h(TabView, {
      selectedIndex: ctrl.currentTab,
      tabs: tabsContent,
      onTabChange: ctrl.onTabChange,
    })
  ]
}

function renderContent(
  ctrl: RelatedCtrl,
  content?: readonly Related[],
  paginator?: Paginator<Related>
) {

  if (!content) {
    return (
      <div className="followingListEmpty">
        {spinner.getVdom('monochrome')}
      </div>
    )
  }
  else if (content.length) {
    const nextPage = paginator && paginator.nextPage
    return (
      <ul className="native_scroller page">
        {content.map((p, i) => renderPlayer(ctrl, p, i))}
        {nextPage ?
          <li
            className="list_item followingList moreFollow"
            oncreate={helper.ontapY(() => ctrl.loadNextPage(nextPage))}
          >
          {ctrl.isLoadingNextPage ? spinner.getVdom('monochrome') : '...'}
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

function renderPlayer(ctrl: RelatedCtrl, obj: Related, i: number) {
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
