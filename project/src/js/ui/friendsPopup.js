import * as helper from './helper';
import router from '../router';
import popupWidget from './shared/popup';
import i18n from '../i18n';
import backbutton from '../backbutton';
import friendsApi from '../lichess/friends';
import * as utils from '../utils';
import * as m from 'mithril';

const friendsPopup = {};

friendsPopup.isOpen = false;

friendsPopup.open = function() {
  backbutton.stack.push(friendsPopup.close);
  friendsPopup.isOpen = true;
};

friendsPopup.close = function(fromBB) {
  if (fromBB !== 'backbutton' && friendsPopup.isOpen) backbutton.stack.pop();
  friendsPopup.isOpen = false;
};

friendsPopup.view = function() {

  function header() {
    return <div><span data-icon="f"/>{i18n('onlineFriends')}</div>;
  }

  return popupWidget(
    {onlineFriends: true, native_scroller: false},
    header,
    renderFriends,
    friendsPopup.isOpen,
    friendsPopup.close
  );
};

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

function renderFriend(user) {

  // hack: Because we have an 'oncreate' within an 'oncreate' two events
  // get fired when the tv button is clicked. So we suppress the 'outer handler'
  // when the TV button is clicked
  let tvTapped = false;

  let userId = utils.userFullNameToId(user.name);
  let action = () => {
    if (!tvTapped) {
      friendsPopup.close();
      router.set('/@/' + userId);
    }
  };

  let tvAction = () => {
    tvTapped = true;
    friendsPopup.close();
    router.set('/@/' + userId + '/tv');
  };

  return user.isPlaying ? (
    <li className="list_item nav" key={userId} oncreate={helper.ontapY(action)}>
      <span>{user.name}</span>
      <span className="friend_tv" data-icon="1" oncreate={helper.ontapY(tvAction)}> </span>
    </li>
  ) : (
    <li className="list_item nav" key={userId} oncreate={helper.ontapY(action)}>
        {user.name}
    </li>
  )
}

export default friendsPopup;
