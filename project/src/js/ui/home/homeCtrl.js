import socket from '../../socket';
import { hasNetwork } from '../../utils';
import * as xhr from './homeXhr';
import m from 'mithril';

export default function homeCtrl() {

  if (!hasNetwork()) {
    m.route('/ai');
  }

  const featured = m.prop({});

  socket.createDefault();

  xhr.featured().then(function(data) {
    featured(data);
    console.log(data);

    const featuredFeed = new EventSource(`http://${window.lichess.apiEndPoint}/tv/feed`);
    featuredFeed.onmessage = function(ev) {
      const obj = JSON.parse(ev.data);
      featured().game.fen = obj.d.fen;
      featured().game.lastMove = obj.d.lm;
      m.redraw();
    };
  });

  return {
    featured,
    goToFeatured() {
      m.route('/game' + featured().url.round);
    }
  };
}
