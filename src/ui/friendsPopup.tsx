import h from 'mithril/hyperscript'
import * as helper from './helper'
import router from '../router'
import popupWidget from './shared/popup'
import i18n, { plural } from '../i18n'
import friendsApi, { Friend } from '../lichess/friends'
import challengeForm from './challengeForm'

let isOpen = false

export default {
  open,
  close,
  view() {

    function header() {
      return [
        h('span', plural('nbFriendsOnline', friendsApi.count()))
      ]
    }

    return popupWidget(
      {onlineFriends: true, native_scroller: false},
      header,
      renderFriends,
      isOpen,
      close
    )
  }
}

function open() {
  router.backbutton.stack.push(close)
  isOpen = true
}

function close(fromBB?: string) {
  if (fromBB !== 'backbutton' && isOpen) router.backbutton.stack.pop()
  isOpen = false
}

function renderFriends() {
  const list = friendsApi.list()

  return list.length ?
    (
      <ul>
        {list.map(renderFriend)}
      </ul>
    ) : (
      <div className="native_scroller nofriend">{i18n('noFriendsOnline')}</div>
    )
}

function renderFriend(friend: Friend) {

  const userId = friend.name.toLowerCase()
  const isBot = friend.title === 'BOT'

  function action() {
    close()
    router.set('/@/' + userId)
  }

  function onTapTv(e: Event) {
    e.stopPropagation()
    close()
    router.set('/@/' + userId + '/tv')
  }

  return (
    <li className="list_item" key={userId} oncreate={helper.ontapY(action)}>
      <div className="friend_name">
        { friend.patron ?
          <span className="patron is-green" data-icon="" />
          :
          null
        }
        <span>
          {friend.title ?
            <span className={'userTitle' + (isBot ? ' bot' : '') }>{friend.title} </span> :
            null
          }
          {friend.name}
        </span>
      </div>
      <div className="onlineFriends_actions">
        { friend.playing ?
          <span className="friend_tv" data-icon="1" oncreate={helper.ontapY(onTapTv)}> </span>
          :
          null
        }
        <span data-icon="U" oncreate={helper.ontapY((e: Event) => {
          e.stopPropagation()
          close()
          challengeForm.open(userId)
        })} />
        <span data-icon="c" oncreate={helper.ontapY((e: Event) => {
          e.stopPropagation()
          close()
          router.set(`/inbox/new/${userId}`)
        })} />
      </div>
    </li>
  )
}
