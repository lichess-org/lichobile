import socket from '../../socket';
import * as utils from '../../utils';
import * as xhr from './tournamentXhr';
import socketHandler from './socketHandler';
import helper from '../helper';
import m from 'mithril';

export default function controller() {
  const tournament = m.prop([]);

  this.tournament = function (tournamentId) {

    helper.analyticsTrackView('Tournament ' + tournamentId);

    let clockInterval = null;
    xhr.tournament(tournamentId).then(data => {
      console.log(data);
      tournament(data);
      clockInterval = setInterval(tick, 1000);
      return data;
    }, err => utils.handleXhrError(err));

    socket.createTournament(tournament().socketVersion, tournamentId, socketHandler(this));

    return {
      tournament,
      onunload: () => {
        socket.destroy();
        if(clockInterval)
          clearInterval(clockInterval);
      }
    };
  }.bind(this);

  this.reload = function (data) {
    tournament(data);
    if(data.socketVersion)
      socket.setVersion(data.socketVersion);
    m.redraw();
  }.bind(this);

  this.tournamentId = function () {
    return tournament().id;
  }.bind(this);

  function tick () {
    let data = tournament();
    if(data.secondsToStart && data.secondsToStart > 0)
      data.secondsToStart--;

    if(data.secondsToFinish && data.secondsToFinish > 0)
      data.secondsToFinish--;

    m.redraw();
  }

  let id = m.route.param('id');
  return this.tournament(id);
}
