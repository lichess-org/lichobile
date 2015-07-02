/** @jsx m */
import helper from './helper';
import popupWidget from './widget/popup';
import i18n from '../i18n';
import backbutton from '../backbutton';
import friendsApi from '../lichess/friends';
import * as utils from '../utils';

const friendsPopup = {};

friendsPopup.isOpen = false;

friendsPopup.open = function() {
  helper.analyticsTrackView('Online Friends');
  backbutton.stack.push(friendsPopup.close);
  friendsPopup.isOpen = true;
};

friendsPopup.close = function(fromBB) {
  if (fromBB !== 'backbutton' && friendsPopup.isOpen) backbutton.stack.pop();
  friendsPopup.isOpen = false;
};

friendsPopup.view = function() {
  const friends = friendsApi.list().length ?
    (
    <ul>
      {friendsApi.list().map(renderFriend)}
    </ul>
    ) : (
      <div className="native_scroller nofriend">{i18n('noFriendsOnline')}</div>
    );

  const header = (
    <div><span data-icon="f"/>{i18n('onlineFriends')}</div>
  );

  return popupWidget(
    {onlineFriends: true, native_scroller: false},
    header,
    friends,
    friendsPopup.isOpen,
    friendsPopup.close
  );
};

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
