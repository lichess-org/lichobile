import widgets from './widget/common';
import layout from './layout';
import helper from './helper';
import utils from '../utils';
import xhr from '../xhr';
import roundCtrl from './round/roundCtrl';
import roundView from './round/view/roundView';

export default {
  controller: function() {
    var round;

    helper.analyticsTrackView('TV');

    function onFeatured(o) {
      xhr.game(o.id, o.color).then(function(data) {
        m.redraw.strategy('all');
        if (round) round.onunload();
        data.tv = true;
        round = new roundCtrl(data, onFeatured);
      }, function(error) {
        utils.handleXhrError(error);
      });
    }

    xhr.featured(m.route.param('flip')).then(function(data) {
      data.tv = true;
      round = new roundCtrl(data, onFeatured);
    }, function(error) {
      utils.handleXhrError(error);
      m.route('/');
    });

    return {
      getRound: function() { return round; },

      onunload: function() {
        if (round) {
          round.onunload();
          round = null;
        }
      }
    };
  },

  view: function(ctrl) {
    if (ctrl.getRound()) return roundView(ctrl.getRound());

    var header, board;

    header = utils.partialf(widgets.connectingHeader, 'Lichess TV');
    board = widgets.viewOnlyBoardContent;

    return layout.board(header, board);
  }
};
