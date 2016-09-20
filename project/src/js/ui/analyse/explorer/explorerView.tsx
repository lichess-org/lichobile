import router from '../../../router';
import * as m from 'mithril';
import * as helper from '../../helper';
import explorerConfig from './explorerConfig';
import { AnalyseCtrlInterface, ExplorerMove, ExplorerGame, ExplorerPlayer } from '../interfaces';

function resultBar(move: ExplorerMove) {
  const sum = move.white + move.draws + move.black;
  function section(key: string) {
    const num: number = (move as any)[key];
    const percent = num * 100 / sum;
    const width = (Math.round(num * 1000 / sum) / 10) + '%';
    return percent === 0 ? null : (
      <span className={'explorerBar ' + key} style={{width}}>
        {percent > 12 ? Math.round(percent) + (percent > 20 ? '%' : '') : null}
      </span>
    );
  }
  return ['white', 'draws', 'black'].map(section);
}

function getTR(e: Event): HTMLElement {
  const target = (e.target as HTMLElement);
  return target.tagName === 'TR' ? target :
    helper.findParentBySelector(target, 'tr');
}

function onTableTap(ctrl: AnalyseCtrlInterface, e: Event) {
  const el = getTR(e);
  if ((el.dataset as any).uci) ctrl.explorerMove((el.dataset as any).uci);
}

function showMoveTable(ctrl: AnalyseCtrlInterface, moves: Array<ExplorerMove>) {
  if (!moves.length) return null;
  return (
    <table className="moves"
      oncreate={helper.ontap(e => onTableTap(ctrl, e), null, null, false, getTR)}
    >
      <thead>
        <tr className="explorerTableHeader">
          <th>Move</th>
          <th>Games</th>
          <th>Rating</th>
          <th>White / Draw / Black</th>
        </tr>
      </thead>
      <tbody>
        { moves.map(move => {
          return (
            <tr key={move.uci} data-uci={move.uci}>
              <td className="explorerMove">
                {move.san[0] === 'P' ? move.san.slice(1) : move.san}
              </td>
              <td className="explorerMove">
                {move.white + move.draws + move.black}
              </td>
              <td className="explorerMove">
                {move.averageRating}
              </td>
              <td className="explorerMove">
                {resultBar(move)}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function showResult(w: Color) {
  if (w === 'white') return <result className="white">1-0</result>;
  if (w === 'black') return <result className="black">0-1</result>;
  return <result className="draws">½-½</result>;
}

function link(ctrl: AnalyseCtrlInterface, e: Event) {
  const orientation = ctrl.chessground.data.orientation;
  const gameId = (getTR(e).dataset as any).id;
  if (gameId && ctrl.explorer.config.data.db.selected() === 'lichess') {
    router.set(`/analyse/online/${gameId}/${orientation}`);
  }
}

function showGameTable(ctrl: AnalyseCtrlInterface, type: any, games: Array<ExplorerGame>) {
  if (!ctrl.explorer.withGames || !games.length) return null;
  return (
    <table className="games"
      oncreate={helper.ontap(e => link(ctrl, e), null, null, false, getTR)}
    >
      <thead>
        <tr className="explorerTableHeader">
          <th colspan="4">{type + ' games'}</th>
        </tr>
      </thead>
      <tbody>
      { games.map((game: ExplorerGame) => {
        return (
          <tr key={game.id} data-id={game.id}>
            <td>
              {[game.white, game.black].map((p: ExplorerPlayer) =>
                <span>{p.rating}</span>
              )}
            </td>
            <td>
              {[game.white, game.black].map((p: ExplorerPlayer) =>
                <span>{p.name}</span>
              )}
            </td>
            <td>
              {showResult(game.winner)}
            </td>
            <td>
              {game.year}
            </td>
          </tr>
        );
      })}
      </tbody>
    </table>
  );
}

function onTablebaseTap(ctrl: AnalyseCtrlInterface, e: Event) {
  const uci = (getTR(e).dataset as any).uci;
  if (uci) ctrl.explorerMove(uci);
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

function winner(stm: any, move: ExplorerMove) {
  if ((stm[0] === 'w' && move.wdl < 0) || (stm[0] === 'b' && move.wdl > 0))
    return 'white';
  else if ((stm[0] === 'b' && move.wdl < 0) || (stm[0] === 'w' && move.wdl > 0))
    return 'black';
  else
    return null;
}

function showDtm(stm: any, move: ExplorerMove) {
  if (move.dtm) return m('result.' + winner(stm, move), {
    title: 'Mate in ' + Math.abs(move.dtm) + ' half-moves (Depth To Mate)'
  }, 'DTM ' + Math.abs(move.dtm));
  else return null;
}

function showDtz(stm: any, move: ExplorerMove) {
  if (move.checkmate) return m('result.' + winner(stm, move), 'Checkmate');
  else if (move.stalemate) return m('result.draws', 'Stalemate');
  else if (move.insufficient_material) return m('result.draws', 'Insufficient material');
  else if (move.dtz === null) return null;
  else if (move.dtz === 0) return m('result.draws', 'Draw');
  else if (move.zeroing) {
    let capture = move.san.indexOf('x') !== -1;
    if (capture) return m('result.' + winner(stm, move), 'Capture');
    else return m('result.' + winner(stm, move), 'Pawn move');
  }
  else return m('result.' + winner(stm, move), {
    title: 'Next capture or pawn move in ' + Math.abs(move.dtz) + ' half-moves (Distance To Zeroing of the 50 move counter)'
  }, 'DTZ ' + Math.abs(move.dtz));
}

function showEmpty(ctrl: AnalyseCtrlInterface) {
  return (
    <div key="explorer-empty" className="data empty scrollerWrapper">
      <div className="title">{showTitle(ctrl)}</div>
      <div className="message">
        <i data-icon="" />
        <h3>No game found</h3>
        <p>{
          ctrl.explorer.config.fullHouse() ?
          'Already searching through all available games.' :
          'Maybe include more games from the preferences menu?'
        }</p>
      </div>
    </div>
  );
}

function showGameEnd(ctrl: AnalyseCtrlInterface, title: string) {
  return m('div.data.empty.scrollerWrapper', {
    key: 'explorer-game-end' + title
  }, [
    m('div.title', 'Game over'),
    m('div.message', [
      m('i[data-icon=]'),
      m('h3', title),
      m('button.button.text[data-icon=L]', {
        oncreate: helper.ontapY(ctrl.explorer.toggle)
      }, 'Close')
    ])
  ]);
}

function show(ctrl: AnalyseCtrlInterface) {
  const data = ctrl.explorer.current();
  if (data && data.opening) {
    const moveTable = showMoveTable(ctrl, data.moves);
    const recentTable = showGameTable(ctrl, 'recent', data.recentGames || []);
    const topTable = showGameTable(ctrl, 'top', data.topGames || []);

    if (moveTable || recentTable || topTable) {
      return (
        <div key="explorer-opening" className="data scrollerWrapper">
          {moveTable}
          {topTable}
          {recentTable}
        </div>
      );
    } else {
      return showEmpty(ctrl);
    }
  }
  else if (data && data.tablebase) {
    const moves = data.moves;
    if (moves.length) {
      return (
        <div key="explorer-tablebase" className="data scrollerWrapper">
          {showTablebase(ctrl, 'Winning', moves.filter((move: ExplorerMove) => move.real_wdl === -2), data.fen)}
          {showTablebase(ctrl, 'Win prevented by 50-move rule', moves.filter((move: ExplorerMove) => move.real_wdl === -1), data.fen)}
          {showTablebase(ctrl, 'Drawn', moves.filter((move: ExplorerMove) => move.real_wdl === 0), data.fen)}
          {showTablebase(ctrl, 'Loss saved by 50-move rule', moves.filter((move: ExplorerMove) => move.real_wdl === 1), data.fen)}
          {showTablebase(ctrl, 'Losing', moves.filter((move: ExplorerMove) => move.real_wdl === 2), data.fen)}
        </div>
      );
    }
    else if (data.checkmate) return showGameEnd(ctrl, 'Checkmate');
    else if (data.stalemate) return showGameEnd(ctrl, 'Stalemate');
    else return showEmpty(ctrl);
  }
  return <div key="explorer-no-data" className="scrollerWrapper" />;
}

function showTitle(ctrl: AnalyseCtrlInterface) {
  if (ctrl.data.game.variant.key === 'standard' || ctrl.data.game.variant.key === 'fromPosition') {
    return 'Opening explorer';
  } else {
    return ctrl.data.game.variant.name + ' opening explorer';
  }
}

function showConfig(ctrl: AnalyseCtrlInterface) {
  return m('div.scrollerWrapper.explorerConfig', {
    key: 'opening-config'
  }, [
    m('div.title', showTitle(ctrl)),
    explorerConfig.view(ctrl.explorer.config)
  ]);
}


function failing() {
  return m('div.failing.message.scrollerWrapper', {
    key: 'failing'
  }, [
    m('i[data-icon=,]'),
    m('h3', 'Oops, sorry!'),
    m('p', 'The explorer is temporarily'),
    m('p', 'out of service. Try again soon!')
  ]);
}

export default function(ctrl: AnalyseCtrlInterface) {
  if (!ctrl.explorer.enabled()) return null;
  const data = ctrl.explorer.current();
  const config = ctrl.explorer.config;
  const configOpened = config.data.open();
  const loading = !configOpened && (ctrl.explorer.loading() || (!data && !ctrl.explorer.failing()));
  const className = helper.classSet({
    explorerTable: true,
    loading
  });
  return (
    <div id="explorerTable" className={className} key="explorer">
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
