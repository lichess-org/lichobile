import * as helper from './helper';
import router from '../router';
import popupWidget from './shared/popup';
import i18n from '../i18n';
import friendsApi, { Friend } from '../lichess/friends';
import * as utils from '../utils';

let isOpen = false;

export default {
  open,
  close,
  view() {

    function header() {
      return <div><span data-icon="f"/>{i18n('onlineFriends')}</div>;
    }

    return popupWidget(
      {onlineFriends: true, native_scroller: false},
      header,
      renderFriends,
      isOpen,
      close
    );
  }
}

function open() {
  router.backbutton.stack.push(close);
  isOpen = true;
}

function close(fromBB?: string) {
  if (fromBB !== 'backbutton' && isOpen) router.backbutton.stack.pop();
  isOpen = false;
}

function renderFriends() {

  return friendsApi.list().length ?
    (
      <ul>
        {friendsApi.list().map(renderFriend)}
      </ul>
    ) : (
      <div className="native_scroller nofriend">{i18n('noFriendsOnline')}</div>
    );
}

function renderFriend(user: Friend) {

  const userId = utils.userFullNameToId(user.name);

  function action() {
    close();
    router.set('/@/' + userId);
  }

  function onTapTv(e: Event) {
    e.stopPropagation();
    close();
    router.set('/@/' + userId + '/tv');
  }

  return (
    <li className="list_item nav" key={userId} oncreate={helper.ontapY(action)}>
      { user.patron ?
        <span className="patron">  </span>
        :
        null
      }
      <span>{user.name}</span>
      { user.playing ?
        <span className="friend_tv" data-icon="1" oncreate={helper.ontapY(onTapTv)}> </span>
        :
        null
      }
    </li>
  );
}
