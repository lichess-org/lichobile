import backbutton from '../../backbutton';
import helper from '../helper';
import m from 'mithril';

export default {
  controller: function(tournament) {
    let isOpen = false;
    const player = m.prop();

    function open(p) {
      player(p);
      backbutton.stack.push(close);
      isOpen = true;
    }

    function close(fromBB) {
      console.log('close');
      if (fromBB !== 'backbutton' && isOpen) backbutton.stack.pop();
      console.log('closed');
      isOpen = false;
    }

    return {
      open,
      close,
      isOpen: function() {
        return isOpen;
      },
      tournament,
      player
    };
  },

  view: function(ctrl) {
    if (!ctrl.isOpen()) return null;

    const tournament = ctrl.tournament();
    if (!tournament) return null;

    const player = ctrl.player();
    if (!player) return null;

    return (
      <div className="modal" id="tournamentPlayerInfoModal" config={helper.slidesInLeft}>
        <header>
          <button className="modal_close" data-icon="L"
            config={helper.ontouch(helper.slidesOutRight(ctrl.close, 'tournamentPlayerInfoModal'))}
          />
          <h2>{player.name}</h2>
        </header>
        <div className="modal_content">
          <div className="tournamentPlayerInfo">
            Player Info
          </div>
        </div>
      </div>
    );
  }
};
