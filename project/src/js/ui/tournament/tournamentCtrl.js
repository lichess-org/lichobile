import socket from '../../socket';
import backbutton from '../../backbutton';
import throttle from 'lodash/function/throttle';
import * as utils from '../../utils';
import * as xhr from './tournamentXhr';
import helper from '../helper';
import m from 'mithril';

export default function controller() {
  socket.createDefault();

  helper.analyticsTrackView('Tournament');

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
