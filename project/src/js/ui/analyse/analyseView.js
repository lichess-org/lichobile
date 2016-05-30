import m from 'mithril';
import isEmpty from 'lodash/isEmpty';
import i18n from '../../i18n';
import treePath from './path';
import cevalView from './ceval/cevalView';
import gameApi from '../../lichess/game';
import control from './control';
import menu from './menu';
import continuePopup from '../shared/continuePopup';
import importPgnPopup from './importPgnPopup';
import { view as renderPromotion } from '../shared/offlineRound/promotion';
import { empty, defined, renderEval, isSynthetic } from './util';
import gameStatusApi from '../../lichess/status';
import variantApi from '../../lichess/variant';
import helper from '../helper';
import layout from '../layout';
import { header, backButton as renderBackbutton } from '../shared/common';
import Board from '../shared/Board';
import { getBoardBounds, noop, partialf, playerName, gameIcon, oppositeColor } from '../../utils';
import notes from '../round/notes';
import button from '../round/view/button';

export default function analyseView(ctrl) {

  const isPortrait = helper.isPortrait();

  const backButton = ctrl.vm.fromGame ? renderBackbutton(i18n('backToGame')) : null;
  const title = ctrl.vm.fromGame ? null : i18n('analysis');

  return layout.board(
    header.bind(undefined, title, backButton),
    () => renderContent(ctrl, isPortrait),
    () => overlay(ctrl, isPortrait)
  );
}

function overlay(ctrl) {
  return [
    renderPromotion(ctrl),
    menu.view(ctrl.menu),
    ctrl.notes ? notes.view(ctrl.notes) : null,
    continuePopup.view(ctrl.continuePopup),
    importPgnPopup.view(ctrl.importPgnPopup)
  ];
}

function renderContent(ctrl, isPortrait) {
  if (!ctrl.data) return null;

  const bounds = getBoardBounds(helper.viewportDim(), isPortrait, helper.isIpadLike(), 'analyse');
  const ceval = ctrl.currentAnyEval();
  const bestMove =  ctrl.ceval.enabled() && ctrl.vm.showBestMove && ceval && ceval.best ? {
    brush: 'paleBlue',
    orig: ceval.best.slice(0, 2),
    dest: ceval.best.slice(2, 4)
  } : null;

  const board = Board(
    ctrl.data,
    ctrl.chessground,
    bounds,
    isPortrait,
    null,
    null,
    bestMove ? [bestMove] : null
  );

  return [
    board,
    <div className="analyseTableWrapper">
      {renderTable(ctrl)}
      {renderActionsBar(ctrl, isPortrait)}
    </div>
  ];
}

function renderTable(ctrl) {
  const className = [
    isSynthetic(ctrl.data) ? 'synthetic' : '',
    'analyseTable'
  ].join(' ');

  return (
    <div className={className}>
      <div className="analyse">
        {renderOpeningBox(ctrl)}
        {renderReplay(ctrl)}
      </div>
      {renderInfos(ctrl)}
    </div>
  );
}

function getChecksCount(ctrl, color) {
  const step = ctrl.vm.step;
  return step.checkCount[oppositeColor(color)];
}

function renderInfos(ctrl) {
  const cevalEnabled = ctrl.ceval.enabled();
  const ceval = ctrl.currentAnyEval();

  const hash = '' + cevalEnabled + (ceval && renderEval(ceval.cp)) +
    (ceval && ceval.mate) + (ceval && ceval.best) +
    ctrl.vm.showBestMove + ctrl.ceval.percentComplete() +
    isEmpty(ctrl.vm.step.dests) + JSON.stringify(ctrl.vm.step.checkCount);

  if (ctrl.vm.infosHash === hash) return {
    subtree: 'retain'
  };
  ctrl.vm.infosHash = hash;

  return (
    <div className="analyseInfos">
      { cevalEnabled ?
        cevalView.renderCeval(ctrl) : null
      }
      { !isSynthetic(ctrl.data) ?
        <div className="native_scroller">
          {gameInfos(ctrl)}
          {renderOpponents(ctrl)}
        </div> : null
      }
    </div>
  );
}

function renderOpponents(ctrl) {
  if (isSynthetic(ctrl.data)) return null;

  const player = ctrl.data.player;
  const opponent = ctrl.data.opponent;
  if (!player || !opponent) return null;

  return (
    <div className="analyseOpponentsWrapper">
      <div className="analyseOpponents">
        <div className="opponent withIcon" data-icon={player.color === 'white' ? 'J' : 'K'}>
          {playerName(player, true)}
          { ctrl.data.game.variant.key === 'threeCheck' && ctrl.vm.step.checkCount ?
            ' (' + getChecksCount(ctrl, player.color) + ')' : null
          }
        </div>
        <div className="opponent withIcon" data-icon={opponent.color === 'white' ? 'J' : 'K'}>
          {playerName(opponent, true)}
          { ctrl.data.game.variant.key === 'threeCheck' && ctrl.vm.step.checkCount ?
            ' (' + getChecksCount(ctrl, opponent.color) + ')' : null
          }
        </div>
      </div>
    </div>
  );
}

function renderEvalTag(e) {
  return {
    tag: 'eval',
    children: e
  };
}

const emptyMove = <move className="emptyMove">...</move>;

function renderMove(ctrl, move, path) {
  if (!move) return emptyMove;
  const pathStr = treePath.write(path);
  const evaluation = path[1] ? {} : (move.oEval || move.ceval || {});
  const className = [
    pathStr === ctrl.vm.pathStr ? 'current' : ''
  ].join(' ');

  const jump = helper.ontouchY(() => ctrl.jump(treePath.read(pathStr)));

  return (
    <move className={className} config={jump}>
      {move.san[0] === 'P' ? move.san.slice(1) : move.san}
      {defined(evaluation.cp) ? renderEvalTag(renderEval(evaluation.cp)) : (
        defined(evaluation.mate) ? renderEvalTag('#' + evaluation.mate) : null
      )}
    </move>
  );
}

function plyToTurn(ply) {
  return Math.floor((ply - 1) / 2) + 1;
}

function renderVariationMenu(ctrl, path) {
  const showing = ctrl.vm.variationMenu && ctrl.vm.variationMenu === treePath.write(path.slice(0, 1));

  if (!showing) return null;

  const promotable = isSynthetic(ctrl.data) ||
    !ctrl.analyse.getStepAtPly(path[0].ply).fixed;

  const content = m('div.variationMenu', [
    m('button', {
      className: 'withIcon',
      'data-icon': 'q',
      config: helper.ontouch(partialf(ctrl.deleteVariation, path))
    }, 'Delete variation'),
    promotable ? m('button', {
      className: 'withIcon',
      'data-icon': 'E',
      config: helper.ontouch(partialf(ctrl.promoteVariation, path))
    }, 'Promote to main line') : null
  ]);

  return (
    <div className="overlay_popup_wrapper variationMenuPopup">
      <div className="popup_overlay_close"
        config={helper.ontouch(helper.fadesOut(ctrl.toggleVariationMenu, '.overlay_popup_wrapper'))} />
      <div className="overlay_popup">
        {content}
      </div>
    </div>
  );
}

function renderVariation(ctrl, variation, path, klass) {
  const visiting = treePath.contains(path, ctrl.vm.path);
  return (
    <div className="variationWrapper">
      <span className="menuIcon fa fa-ellipsis-v" config={helper.ontouchY(partialf(ctrl.toggleVariationMenu, path))}></span>
      <div className={klass + ' variation' + (visiting ? ' visiting' : '')}>
        {renderVariationContent(ctrl, variation, path)}
        {renderVariationMenu(ctrl, path)}
      </div>
    </div>
  );
}

function renderVariationNested(ctrl, variation, path) {
  return (
    <span className="variation nested">
      (
      {renderVariationContent(ctrl, variation, path)}
      )
    </span>
  );
}

function renderVariationContent(ctrl, variation, path) {
  const turns = [];
  if (variation[0].ply % 2 === 0) {
    variation = variation.slice(0);
    const move = variation.shift();
    turns.push({
      turn: plyToTurn(move.ply),
      black: move
    });
  }
  const visiting = treePath.contains(path, ctrl.vm.path);
  const maxPlies = Math.min(visiting ? 999 : (path[2] ? 2 : 4), variation.length);
  for (var i = 0; i < maxPlies; i += 2) turns.push({
    turn: plyToTurn(variation[i].ply),
    white: variation[i],
    black: variation[i + 1]
  });
  return turns.map(turn => renderVariationTurn(ctrl, turn, path));
}

function renderVariationMeta(ctrl, move, path) {
  if (!move || empty(move.variations)) return null;
  return move.variations.map(function(variation, i) {
    return renderVariationNested(ctrl, variation, treePath.withVariation(path, i + 1));
  });
}

function renderVariationTurn(ctrl, turn, path) {
  const wPath = turn.white ? treePath.withPly(path, turn.white.ply) : null;
  const wMove = wPath ? renderMove(ctrl, turn.white, wPath) : null;
  const wMeta = renderVariationMeta(ctrl, turn.white, wPath);
  const bPath = turn.black ? treePath.withPly(path, turn.black.ply) : null;
  const bMove = bPath ? renderMove(ctrl, turn.black, bPath) : null;
  const bMeta = renderVariationMeta(ctrl, turn.black, bPath);
  if (wMove) {
    if (wMeta) return [
        renderIndex(turn.turn + '.'),
        wMove,
        wMeta,
        bMove ? bMove : null,
        bMove ? bMeta : null
    ];
    return [
        renderIndex(turn.turn + '.'),
        wMove,
        bMeta ? ' ' : null,
        bMove ? bMove : null,
        bMove ? bMeta : null
    ];
  }
  return [
      renderIndex(turn.turn + '...'),
      bMove,
      bMeta
  ];
}

function renderOpeningBox(ctrl) {
  const opening = ctrl.data.game.opening;

  const hash = '' + (opening && opening.eco + opening.name);

  if (ctrl.vm.openingHash === hash) {
    return {
      subtree: 'retain'
    };
  }
  ctrl.vm.openingHash = hash;

  if (opening) {
    const config = helper.ontouch(noop, () =>
      window.plugins.toast.show(opening.eco + ' ' + opening.name, 'short', 'center'));

    return (
      <div className="analyseOpening" config={config}>
        <strong>{opening.eco}&nbsp;</strong>
        <span>{opening.name}</span>
      </div>
    );
  }

  return null;
}

function renderMeta(ctrl, move, path) {
  if (!move || empty(move.variations)) return null;

  const children = [];
  const colorClass = move.ply % 2 === 0 ? 'black ' : 'white ';
  if (!empty(move.variations)) {
    for (var i = 0, len = move.variations.length; i < len; i++) {
      const variation = move.variations[i];
      if (empty(variation)) return null;
      children.push(renderVariation(
        ctrl,
        variation,
        treePath.withVariation(path, i + 1),
        i === 0 ? colorClass : null
      ));
    }
  }
  return (
    <div key={move.ply + ':meta'} className="meta">{children}</div>
  );
}

function turnKey(turn, meta) {
  const key = turn.turn.toString() + ':' + (meta ? meta : '');
  return key;
}

function renderIndex(txt) {
  return {
    tag: 'index',
    children: [txt]
  };
}

function renderTurnEl(children, key) {
  return {
    tag: 'turn',
    attrs: { key },
    children: children
  };
}

function renderTurn(ctrl, turn, path) {
  const index = renderIndex(turn.turn);
  const wPath = turn.white ? treePath.withPly(path, turn.white.ply) : null;
  const wMove = wPath ? renderMove(ctrl, turn.white, wPath) : null;
  const wMeta = renderMeta(ctrl, turn.white, wPath);
  const bPath = turn.black ? treePath.withPly(path, turn.black.ply) : null;
  const bMove = bPath ? renderMove(ctrl, turn.black, bPath) : null;
  const bMeta = renderMeta(ctrl, turn.black, bPath);
  if (wMove) {
    if (wMeta) {
      const temp = [
        renderTurnEl([index, wMove, emptyMove], turnKey(turn, 'emptyBlack')),
        wMeta
      ];
      if (bMove) {
        if (bMeta) {
          temp.concat([
            renderTurnEl([index, emptyMove, bMove], turnKey(turn, 'emptyWhiteAfterWhiteMetaAndBlackMeta')),
            bMeta
          ]);
        } else {
          temp.push(
            renderTurnEl([index, emptyMove, bMove], turnKey(turn, 'emptyWhiteAfterWhiteMeta'))
          );
        }
      }
      return temp;
    } else if (bMeta) {
      return [
        renderTurnEl([index, wMove, bMove], turnKey(turn, 'andBlackMeta')),
        bMeta
      ];
    } else {
      return renderTurnEl([index, wMove, bMove], turnKey(turn));
    }
  }
  else if (bMeta) {
    return [
      renderTurnEl([index, emptyMove, bMove], turnKey(turn, 'emptyWhiteAndBlackMeta')),
      bMeta
    ];
  } else {
    return renderTurnEl([index, emptyMove, bMove], turnKey(turn, 'emptyWhite'));
  }
}

function renderTree(ctrl, tree) {
  const turns = [];
  const initPly = ctrl.analyse.firstPly();
  if (initPly % 2 === 0) {
    for (var i = 1, nb = tree.length; i < nb; i += 2) turns.push({
      turn: Math.floor((initPly + i) / 2) + 1,
      white: tree[i],
      black: tree[i + 1]
    });
  }
  else {
    turns.push({
      turn: Math.floor(initPly / 2) + 1,
      white: null,
      black: tree[1]
    });
    for (var j = 2, jnb = tree.length; j < jnb; j += 2) turns.push({
      turn: Math.floor((initPly + j) / 2) + 1,
      white: tree[j],
      black: tree[j + 1]
    });
  }

  const path = treePath.default();
  var tags = [];
  for (var k = 0, len = turns.length; k < len; k++) {
    tags = tags.concat(renderTurn(ctrl, turns[k], path));
  }

  return tags;
}

function renderReplay(ctrl) {

  var result;
  if (ctrl.data.game.status.id >= 30) switch (ctrl.data.game.winner) {
    case 'white':
      result = '1-0';
      break;
    case 'black':
      result = '0-1';
      break;
    default:
      result = '½-½';
  }
  const tree = renderTree(ctrl, ctrl.analyse.tree);
  if (result) {
    tree.push(<div key="gameResult" className="result">{result}</div>);
    const winner = gameApi.getPlayer(ctrl.data, ctrl.data.game.winner);
    tree.push(
      <div key="gameStatus" className="status">
        {gameStatusApi.toLabel(ctrl.data.game.status.name, ctrl.data.game.winner, ctrl.data.game.variant.key)}

        {winner ? '. ' + i18n(winner.color === 'white' ? 'whiteIsVictorious' : 'blackIsVictorious') + '.' : null}
      </div>
    );
  }

  return (
    <div id="replay" className="analyseReplay native_scroller">
      {tree}
    </div>
  );
}

function gameInfos(ctrl) {
  if (isSynthetic(ctrl.data)) return null;

  const data = ctrl.data;
  const time = gameApi.time(data);
  const mode = data.game.offline ? i18n('offline') :
    data.game.rated ? i18n('rated') : i18n('casual');
  const icon = data.opponent.ai ? ':' : gameIcon(data.game.perf || data.game.variant.key);
  const variantLink = helper.ontouch(
    () => {
      const link = variantApi(data.game.variant.key).link;
      if (link)
        window.open(link, '_blank');
    },
    () => window.plugins.toast.show(data.game.variant.title, 'short', 'center')
  );

  return (
    <div className="analyseGameInfosWrapper">
      <div className="analyseGameInfos" data-icon={icon}>
        {time + ' • '}
        <span className="variant" config={variantLink}>
          {data.game.variant.name}
        </span>
        <br/>
        {mode}
      </div>
    </div>
  );
}

function buttons(ctrl) {
  return [
      ['first', 'fast-backward', control.first ],
      ['prev', 'backward', control.prev],
      ['next', 'forward', control.next],
      ['last', 'fast-forward', control.last]
    ].map(function(b) {
      const className = [
        'action_bar_button',
        'fa',
        'fa-' + b[1],
        ctrl.broken ? 'disabled' : '',
        ctrl.vm.late && b[0] === 'last' ? 'glow' : ''
        ].join(' ');
        const action = b[0] === 'prev' || b[0] === 'next' ?
          helper.ontouch(() => b[2](ctrl), null, () => b[2](ctrl)) :
          helper.ontouch(() => b[2](ctrl));
        return (
          <button className={className} key={b[1]} config={action} />
        );
    });
}

function renderActionsBar(ctrl) {

  const hash = ctrl.data.game.id + ctrl.broken + ctrl.vm.late;

  if (ctrl.vm.buttonsHash === hash) return {
    subtree: 'retain'
  };
  ctrl.vm.buttonsHash = hash;

  const sharePGN = helper.ontouch(
    ctrl.sharePGN,
    () => window.plugins.toast.show('Share PGN', 'short', 'bottom')
  );

  return (
    <section className="actions_bar">
      <button className="action_bar_button fa fa-ellipsis-h" key="analyseMenu"
        config={helper.ontouch(ctrl.menu.open)}
      />
      {ctrl.source === 'offline' || !gameApi.playable(ctrl.data) ?
        <button className="action_bar_button fa fa-share-alt" key="sharePGN"
          config={sharePGN}
        /> : null
      }
      {ctrl.notes ? button.notes(ctrl) : null}
      <button className="action_bar_button" data-icon="B" key="flipBoard"
        config={helper.ontouch(
          ctrl.flip,
          () => window.plugins.toast.show(i18n('flipBoard'), 'short', 'bottom')
        )}
      />
      {buttons(ctrl)}
    </section>
  );
}
