import { renderPlayer } from '../following/followingView'
import * as helper from '../../helper'

import { IFollowersCtrl } from './followersCtrl'

export function renderBody(ctrl: IFollowersCtrl) {
  if (ctrl.followers().length) {
    const paginator = ctrl.paginator()
    const nextPage = paginator && paginator.nextPage
    return (
      <ul className="native_scroller page">
        {ctrl.followers().map(p => renderPlayer(ctrl, p))}
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
