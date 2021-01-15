import h from 'mithril/hyperscript'
import router from '../../router'
import * as utils from '../../utils'
import countries from '../../utils/countries'
import { getLanguageNativeName } from '../../utils/langs'
import session from '../../session'
import i18n from '../../i18n'
import spinner from '../../spinner'
import { playerName } from '../../lichess/player'
import { Player } from '../../lichess/interfaces/game'
import { Score } from '../../lichess/interfaces/user'
import * as helper from '../helper'

import popupWidget from './popup'
import { userStatus } from './common'

interface Attrs {
  readonly player: Player
  readonly opponent: Player
  readonly mini: any
  readonly isOpen: boolean
  readonly close: () => void
  readonly score?: Score
}

export default {

  view({ attrs }) {
    const { player, mini, isOpen, close, opponent, score } = attrs
    const user = player.user

    return user ? popupWidget(
      'miniUserInfos',
      undefined,
      () => content(mini, player, opponent, score),
      isOpen,
      close
    ) : null
  }
} as Mithril.Component<Attrs>

function content(mini: any, player: Player, opponent: Player, score?: Score) {
  const user = player.user
  if (!mini || !user) {
    return (
      <div className="miniUser">
        {spinner.getVdom()}
      </div>
    )
  }
  const isMe = session.getUserId() === user.id
  const oppUser = opponent.user
  const status = userStatus(user)
  const curSess = session.get()
  const sessionUserId = curSess && curSess.id
  const showYourScore = sessionUserId && mini.crosstable && mini.crosstable.nbGames > 0
  return (
    <div className="miniUser">
      <div className="title">
        <div className="username" oncreate={helper.ontap(() => router.set(`/@/${user.username}`))}>
          {status}
        </div>
        { user.profile && user.profile.country ?
          <p className="country">
            <img className="flag" src={utils.lichessAssetSrc('images/flags/' + user.profile.country + '.png')} />
            {countries[user.profile.country]}
          </p> : user.language ?
          <p className="language">
            <span className="fa fa-comment-o" />
            {getLanguageNativeName(user.language)}
          </p> : null
        }
      </div>
      { user.tosViolation || user.booster ?
        <div className="warning">
          {user.tosViolation ? i18n('thisAccountViolatedTos') : ''}
          {user.booster ? i18n('thisPlayerArtificiallyIncreasesTheirRating') : ''}
        </div> : null
      }
      { mini.perfs ?
        <div className="mini_perfs">
        {Object.keys(mini.perfs).map((p: string) => {
          const perf = mini.perfs[p]
          return (
            <div className="perf">
              <span data-icon={utils.gameIcon(p as PerfKey)} />
              {perf.games > 0 ? perf.rating + (perf.prov ? '?' : '') : '-'}
            </div>
          )
        })}
        </div> : null
      }
      { sessionUserId !== undefined && showYourScore ?
        <div className="score_wrapper">
          Your score: <span className="score">{`${mini.crosstable.users[sessionUserId]} - ${mini.crosstable.users[user.id]}`}</span>
        </div> : null
      }
      { !showYourScore && oppUser && score && score.nbGames > 0 ?
        <div className="score_wrapper">
          Lifetime score <em>vs</em> {playerName(opponent)}:
          <br/>
          <span className="score">{score.users[user.id]}</span> - <span className="score">{score.users[oppUser.id]}</span>
        </div> : null
      }
      { !isMe ?
        <div className="mini_user_actions_wrapper">
          <button data-icon="1"
            oncreate={helper.ontap(() => {
              router.set(`/@/${user.id}/tv`)
            })}
          >
            {i18n('watchGames')}
          </button>
        </div> : null
      }
    </div>
  )
}
