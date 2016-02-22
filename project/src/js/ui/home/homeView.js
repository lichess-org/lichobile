import m from 'mithril';
import { noop } from '../../utils';
import layout from '../layout';
import helper from '../helper';
import { header as headerWidget } from '../shared/common';
import ViewOnlyBoard from '../shared/ViewOnlyBoard';

export default function homeView(ctrl) {

  function body() {
    const { fen, lastMove } = ctrl.featured().game;
    const orientation = ctrl.featured().orientation;
    return (
      <div className="home">
        <section id="homeFeatured">
          <h2 className="contentTitle">Featured</h2>
          <div className="board_wrapper mini_board" config={helper.ontouchY(ctrl.goToFeatured)}>
          {m.component(ViewOnlyBoard, {fen, lastMove, orientation })}
          </div>
        </section>
      </div>
    );
  }

  return layout.free(headerWidget.bind(undefined, 'lichess.org'), body, noop);
}
