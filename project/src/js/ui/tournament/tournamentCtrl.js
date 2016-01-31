import socket from '../../socket';
import * as utils from '../../utils';
import * as xhr from './tournamentXhr';
import socketHandler from './socketHandler';
import helper from '../helper';
import m from 'mithril';

export default function controller() {

  function tournamentList () {
    socket.createDefault();

    helper.analyticsTrackView('Tournament List');

    const tournaments = m.prop([]);

    xhr.currentTournaments().then(data => {
      console.log(data);
      tournaments(data);
      return data;
    }, err => utils.handleXhrError(err));


    return {
      tournaments,
      onunload: () => {
        socket.destroy();
      }
    };
  }

  const tournament = m.prop([]);

  this.tournamentHome = function (tournamentId) {
    //socket.createDefault();

    helper.analyticsTrackView('Tournament Home' + tournamentId);

    xhr.tournament(tournamentId).then(data => {
      console.log(data);
      tournament(data);
      return data;
    }, err => utils.handleXhrError(err));

    socket.createTournament(1, tournamentId, socketHandler(this));

    return {
      tournament,
      onunload: () => {
        socket.destroy();
      }
    };
  }.bind(this);

  this.reload = function (data) {
    tournament(data);
    m.redraw(false, true);
  }.bind(this);

  this.tournamentId = function () {
    return tournament().id;
  }.bind(this);

  let id = m.route.param('id');
  if (!id)
    return tournamentList();
  else
    return this.tournamentHome(id);
}
