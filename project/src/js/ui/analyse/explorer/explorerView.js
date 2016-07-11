import m from 'mithril';
import helper from '../../helper';
import explorerConfig from './explorerConfig';

function resultBar(move) {
  const sum = move.white + move.draws + move.black;
  function section(key) {
    const percent = move[key] * 100 / sum;
    const width = (Math.round(move[key] * 1000 / sum) / 10) + '%';
    return percent === 0 ? null : (
      <span className={'explorerBar ' + key} style={{width}}>
        {percent > 12 ? Math.round(percent) + (percent > 20 ? '%' : '') : null}
      </span>
    );
  }
  return ['white', 'draws', 'black'].map(section);
}

var lastShow = <div className="scrollerWrapper" />;

function showMoveTable(ctrl, moves) {
  if (!moves.length) return null;
  return (
    <table className="moves">
      <thead>
        <tr>
          <th>Move</th>
          <th>Games</th>
          <th>Rating</th>
          <th>White / Draw / Black</th>
        </tr>
      </thead>
      <tbody>
        { moves.map(move => {
          return (
            <tr key={move.uci} config={helper.ontouchY(() => ctrl.explorerMove(move.uci))}>
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

function showResult(w) {
  if (w === 'white') return <result className="white">1-0</result>;
  if (w === 'black') return <result className="black">0-1</result>;
  return <result className="draws">½-½</result>;
}

function showGameTable(ctrl, type, games) {
  if (!ctrl.explorer.withGames || !games.length) return null;
  function link(game) {
    const orientation = ctrl.chessground.data.orientation;
    if (ctrl.explorer.config.data.db.selected() === 'lichess') {
      m.route(`/analyse/online/${game.id}/${orientation}`);
    }
  }
  return (
    <table className="games">
      <thead>
        <tr>
          <th colspan="4">{type + ' games'}</th>
        </tr>
      </thead>
      <tbody>
      { games.map(game => {
        return (
          <tr key={game.id} config={helper.ontouchY(() => link(game))}>
            <td>
              {[game.white, game.black].map(p =>
                <span>{p.rating}</span>
              )}
            </td>
            <td>
              {[game.white, game.black].map(p =>
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

function showTablebase(ctrl, title, moves, fen) {
  var stm = fen.split(/\s/)[1];
  if (!moves.length) return null;
  return [
    <div className="title">{title}</div>,
    <table className="explorerTablebase">
      <tbody>
      {moves.map(move => {
        return <tr key={move.uci}>
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

function winner(stm, move) {
  if ((stm[0] === 'w' && move.wdl < 0) || (stm[0] === 'b' && move.wdl > 0))
    return 'white';
  else if ((stm[0] === 'b' && move.wdl < 0) || (stm[0] === 'w' && move.wdl > 0))
    return 'black';
  else
    return null;
}

function showDtm(stm, move) {
  if (move.dtm) return m('result.' + winner(stm, move), {
    title: 'Mate in ' + Math.abs(move.dtm) + ' half-moves (Depth To Mate)'
  }, 'DTM ' + Math.abs(move.dtm));
  else return null;
}

function showDtz(stm, move) {
  if (move.checkmate) return m('result.' + winner(stm, move), 'Checkmate');
  else if (move.stalemate) return m('result.draws', 'Stalemate');
  else if (move.insufficient_material) return m('result.draws', 'Insufficient material');
  else if (move.dtz === null) return null;
  else if (move.dtz === 0) return m('result.draws', 'Draw');
  else if (move.zeroing) {
    var capture = move.san.indexOf('x') !== -1;
    if (capture) return m('result.' + winner(stm, move), 'Capture');
    else return m('result.' + winner(stm, move), 'Pawn move');
  }
  else return m('result.' + winner(stm, move), {
    title: 'Next capture or pawn move in ' + Math.abs(move.dtz) + ' half-moves (Distance To Zeroing of the 50 move counter)'
  }, 'DTZ ' + Math.abs(move.dtz));
}

function showEmpty(ctrl) {
  return (
    <div className="data empty scrollerWrapper">
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

function showGameEnd(ctrl, title) {
  return m('div.data.empty.scrollerWrapper', [
    m('div.title', 'Game over'),
    m('div.message', [
      m('i[data-icon=]'),
      m('h3', title),
      m('button.button.text[data-icon=L]', {
        config: helper.ontouchY(ctrl.explorer.toggle)
      }, 'Close')
    ])
  ]);
}

function show(ctrl) {
  const data = ctrl.explorer.current();
  if (data && data.opening) {
    const moveTable = showMoveTable(ctrl, data.moves, data.fen);
    const recentTable = showGameTable(ctrl, 'recent', data.recentGames || []);
    const topTable = showGameTable(ctrl, 'top', data.topGames || []);

    if (moveTable || recentTable || topTable) {
      lastShow = (
        <div className="data scrollerWrapper">
          {moveTable}
          {topTable}
          {recentTable}
        </div>
      );
    } else {
      lastShow = showEmpty(ctrl);
    }
  }
  else if (data && data.tablebase) {
    const moves = data.moves;
    if (moves.length) {
      lastShow = (
        <div className="data scrollerWrapper">
          {showTablebase(ctrl, 'Winning', moves.filter(move => move.real_wdl === -2), data.fen)}
          {showTablebase(ctrl, 'Win prevented by 50-move rule', moves.filter(move => move.real_wdl === -1), data.fen)}
          {showTablebase(ctrl, 'Drawn', moves.filter(move => move.real_wdl === 0), data.fen)}
          {showTablebase(ctrl, 'Loss saved by 50-move rule', moves.filter(move => move.real_wdl === 1), data.fen)}
          {showTablebase(ctrl, 'Losing', moves.filter(move => move.real_wdl === 2), data.fen)}
        </div>
      );
    }
    else if (data.checkmate) lastShow = showGameEnd(ctrl, 'Checkmate');
    else if (data.stalemate) lastShow = showGameEnd(ctrl, 'Stalemate');
    else lastShow = showEmpty(ctrl);
  }
  return lastShow;
}

function showTitle(ctrl) {
  if (ctrl.data.game.variant.key === 'standard' || ctrl.data.game.variant.key === 'fromPosition') {
    return 'Opening explorer';
  } else {
    return ctrl.data.game.variant.name + ' opening explorer';
  }
}

function showConfig(ctrl) {
  return m('div.scrollerWrapper.explorerConfig', [
    m('div.title', showTitle(ctrl)),
    explorerConfig.view(ctrl.explorer.config)
  ]);
}


function failing() {
  return m('div.failing.message.scrollerWrapper', [
    m('i[data-icon=,]'),
    m('h3', 'Oops, sorry!'),
    m('p', 'The explorer is temporarily'),
    m('p', 'out of service. Try again soon!')
  ]);
}

export default function(ctrl) {
  if (!ctrl.explorer.enabled()) return null;
  const data = ctrl.explorer.current();
  const config = ctrl.explorer.config;
  const configOpened = config.data.open();
  const loading = !configOpened && (ctrl.explorer.loading() || (!data && !ctrl.explorer.failing()));
  const content = configOpened ? showConfig(ctrl) : (ctrl.explorer.failing() ? failing() : show(ctrl));
  const className = helper.classSet({
    explorerTable: true,
    loading
  });
  return (
    <div id="explorerTable" className={className} key="explorer">
      <div className="spinner_overlay">
        <div className="spinner fa fa-hourglass-half" />
      </div>
      {content}
      {(!content || ctrl.explorer.failing()) ? null :
        <span className="toconf" data-icon={configOpened ? 'L' : '%'}
          config={helper.ontouch(config.toggleOpen)} />
      }
    </div>
  );
}
