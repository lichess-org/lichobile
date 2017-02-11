import * as h from 'mithril/hyperscript';
import * as helper from '../../helper';
import explorerConfig from './explorerConfig';
import { AnalyseCtrlInterface, ExplorerMove } from '../interfaces';
import OpeningTable, { Attrs as OpeningTableAttrs, showEmpty, getTR } from './OpeningTable';

function onTablebaseTap(ctrl: AnalyseCtrlInterface, e: Event) {
  const el = getTR(e)
  const uci = el && el.dataset['uci'];
  if (uci) ctrl.explorerMove(uci);
}

function showTitle(ctrl: AnalyseCtrlInterface): Mithril.Children {
  const data = ctrl.explorer.current()
  const opening = ctrl.analyse.getOpening(ctrl.vm.path) || ctrl.data.game.opening
  if (ctrl.data.game.variant.key === 'standard' || ctrl.data.game.variant.key === 'fromPosition') {
    if (data && data.tablebase) return 'Endgame tablebase'
    else return opening ? opening.eco + ' ' + opening.name : 'Opening explorer'
  } else {
    const what = data && data.tablebase ? ' endgame tablebase' :  ' opening explorer'
    return ctrl.data.game.variant.name + what
  }
}


function showTablebase(ctrl: AnalyseCtrlInterface, title: string, moves: Array<ExplorerMove>, fen: string) {
  let stm = fen.split(/\s/)[1];
  if (!moves.length) return null;
  return [
    <div className="title">{title}</div>,
    <table className="explorerTablebase"
      oncreate={helper.ontap(e => onTablebaseTap(ctrl, e), null, null, false, getTR)}
    >
      <tbody>
      {moves.map((move: ExplorerMove) => {
        return <tr data-uci={move.uci} key={move.uci}>
          <td>{move.san}</td>
          <td>
            {showDtz(stm, move)}
            {showDtm(stm, move)}
          </td>
        </tr>;
      })}
      </tbody>
    </table>
  ];
}

function winner(stm: string, move: ExplorerMove) {
  if ((stm[0] === 'w' && move.wdl < 0) || (stm[0] === 'b' && move.wdl > 0))
    return 'white';
  else if ((stm[0] === 'b' && move.wdl < 0) || (stm[0] === 'w' && move.wdl > 0))
    return 'black';
  else
    return null;
}

function showDtm(stm: string, move: ExplorerMove) {
  if (move.dtm) return h('result.' + winner(stm, move), {
    title: 'Mate in ' + Math.abs(move.dtm) + ' half-moves (Depth To Mate)'
  }, 'DTM ' + Math.abs(move.dtm));
  else return null;
}

function showDtz(stm: string, move: ExplorerMove) {
  if (move.checkmate) return h('result.' + winner(stm, move), 'Checkmate');
  else if (move.stalemate) return h('result.draws', 'Stalemate');
  else if (move.variant_win) return h('result.' + winner(stm, move), 'Variant loss');
  else if (move.variant_loss) return h('result.' + winner(stm, move), 'Variant win');
  else if (move.insufficient_material) return h('result.draws', 'Insufficient material');
  else if (move.dtz === null) return null;
  else if (move.dtz === 0) return h('result.draws', 'Draw');
  else if (move.zeroing) {
    let capture = move.san.indexOf('x') !== -1;
    if (capture) return h('result.' + winner(stm, move), 'Capture');
    else return h('result.' + winner(stm, move), 'Pawn move');
  }
  else return h('result.' + winner(stm, move), {
    title: 'Next capture or pawn move in ' + Math.abs(move.dtz) + ' half-moves (Distance To Zeroing of the 50 move counter)'
  }, 'DTZ ' + Math.abs(move.dtz));
}

function showGameEnd(ctrl: AnalyseCtrlInterface, title: string) {
  return h('div.explorer-data.empty', {
    key: 'explorer-game-end' + title
  }, [
    h('div.title', 'Game over'),
    h('div.message', [
      h('i[data-icon=]'),
      h('h3', title),
      h('button.button.text[data-icon=L]', {
        oncreate: helper.ontapY(ctrl.explorer.toggle)
      }, 'Close')
    ])
  ]);
}

function show(ctrl: AnalyseCtrlInterface) {
  const data = ctrl.explorer.current();
  if (data && data.opening) {
    return h(OpeningTable, { data, ctrl });
  }
  else if (data && data.tablebase) {
    const moves = data.moves;
    if (moves.length) {
      return (
        <div key="explorer-tablebase" className="explorer-data">
          {showTablebase(ctrl, 'Winning', moves.filter((move: ExplorerMove) => move.wdl === -2), data.fen)}
          {showTablebase(ctrl, 'Unknown', moves.filter((move: ExplorerMove) => move.wdl === null), data.fen)}
          {showTablebase(ctrl, 'Win prevented by 50-move rule', moves.filter((move: ExplorerMove) => move.wdl === -1), data.fen)}
          {showTablebase(ctrl, 'Drawn', moves.filter((move: ExplorerMove) => move.wdl === 0), data.fen)}
          {showTablebase(ctrl, 'Loss saved by 50-move rule', moves.filter((move: ExplorerMove) => move.wdl === 1), data.fen)}
          {showTablebase(ctrl, 'Losing', moves.filter((move: ExplorerMove) => move.wdl === 2), data.fen)}
        </div>
      );
    }
    else if (data.checkmate) return showGameEnd(ctrl, 'Checkmate');
    else if (data.stalemate) return showGameEnd(ctrl, 'Stalemate');
    else if (data.variant_win || data.variant_loss) return showGameEnd(ctrl, 'Variant end');
    else return showEmpty(ctrl);
  }
  return <div key="explorer-no-data" />;
}

function showConfig(ctrl: AnalyseCtrlInterface) {
  return h('div.explorerConfig', {
    key: 'opening-config'
  }, explorerConfig.view(ctrl.explorer.config));
}

function failing() {
  return h('div.failing.message', {
    key: 'failing'
  }, [
    h('i[data-icon=,]'),
    h('h3', 'Oops, sorry!'),
    h('p', 'The explorer is temporarily'),
    h('p', 'out of service. Try again soon!')
  ]);
}

export default function(ctrl: AnalyseCtrlInterface) {
  if (!ctrl.explorer.enabled()) return null;
  const data = ctrl.explorer.current();
  const config = ctrl.explorer.config;
  const configOpened = config.open();
  const loading = !configOpened && ctrl.explorer.loading();
  const className = helper.classSet({
    explorerTable: true,
    loading
  });
  return (
    <div id="explorerTable" className={className} key="explorer">
      <div className="explorer-fixedTitle">{showTitle(ctrl)}</div>
      { loading ? <div key="loader" className="spinner_overlay">
        <div className="spinner fa fa-hourglass-half" />
      </div> : null
      }
      { configOpened ? showConfig(ctrl) : null }
      { !configOpened && ctrl.explorer.failing() ? failing() : null }
      { !configOpened && !ctrl.explorer.failing() ? show(ctrl) : null }
      { configOpened || (data && data.opening) ?
        <span key={configOpened ? 'config-onpen' : 'config-close'} className="toconf" data-icon={configOpened ? 'L' : '%'}
          oncreate={helper.ontap(config.toggleOpen)}
        /> : null
      }
    </div>
  );
}
