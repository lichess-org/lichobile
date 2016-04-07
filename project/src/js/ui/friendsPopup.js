import helper from './helper';
import popupWidget from './shared/popup';
import i18n from '../i18n';
import backbutton from '../backbutton';
import friendsApi from '../lichess/friends';
import * as utils from '../utils';
import m from 'mithril';

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

function renderFriend(name) {
  let userId = utils.userFullNameToId(name);
  let action = () => {
    friendsPopup.close();
    m.route('/@/' + userId);
  };

  return (
    <li className="list_item nav" key={userId} config={helper.ontouchY(action)}>
      {name}
    </li>
  );
}

export default friendsPopup;
