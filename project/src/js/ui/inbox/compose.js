import backbutton from '../../backbutton';
import router from '../../router';
import * as helper from '../helper';
import * as xhr from './inboxXhr';
import i18n from '../../i18n';

export default {
  controller: function() {
    let isOpen = false;

    function open() {
      /*
      xhr.playerInfo(tournament().id, playerId)
      .then(data => {
        playerData(data);
        backbutton.stack.push(helper.slidesOutRight(close, 'tournamentPlayerInfoModal'));
        isOpen = true;
      })
      .catch(utils.handleXhrError);
      */
    }

    function close(fromBB) {
      if (fromBB !== 'backbutton' && isOpen) backbutton.stack.pop();
      isOpen = false;
    }

    return {
      open,
      close,
      isOpen: function() {
        return isOpen;
      }
    };
  },

  view: function(ctrl) {
    if (!ctrl.isOpen()) return null;

    return null;
  }
};
