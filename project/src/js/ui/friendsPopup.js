/** @jsx m */
import helper from './helper';
import popupWidget from './widget/popup';
import i18n from '../i18n';
import backbutton from '../backbutton';
import friendsApi from '../lichess/friends';
import utils from '../utils';

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
  const friends = (
    <ul className="native_scroller">
      {friendsApi.list().map(renderFriend)}
    </ul>
  );

  const header = (
    <div><span data-icon="f"/>{i18n('onlineFriends')}</div>
  );

  return popupWidget(
    'onlineFriends',
    header,
    friends,
    friendsPopup.isOpen,
    friendsPopup.close
  );
};

function renderFriend(name) {
  let userId = utils.userFullNameToId(name);
  let action = () => m.route('/@/' + userId);

  return (
    <li className="list_item nav" key={userId} config={helper.ontouchY(action)}>
      {name}
    </li>
  );
}

export default friendsPopup;
