import * as m from 'mithril';
import { header as headerWidget, backButton as renderBackbutton } from '../shared/common';
import layout from '../layout';
import i18n from '../../i18n';
import {SearchState, Select, Option, UserGameWithDate} from './interfaces';
import redraw from '../../utils/redraw';
import settings from '../../settings';
import { renderPlayer, renderBoard, getButton, getGameEl } from '../user/games/gamesView';
import * as helper from '../helper';
import * as gameApi from '../../lichess/game';
import gameStatus from '../../lichess/status';
import session from '../../session';
import * as utils from '../../utils';
import router from '../../router';

export default function view(vnode: Mithril.Vnode<{}, SearchState>) {
  const ctrl = vnode.state;

  function header() {
    return headerWidget(renderBackbutton('Search'));
  }

  return layout.free(header, () => renderSearchForm(ctrl));
}

function renderSearchForm(ctrl: SearchState) {
  const ratingOptions = settings.search.ratings.map((a: string) => ({value: a, label: a}));
  const opponents = [['0', i18n('human') + ' ' + i18n('opponent')], ['1', i18n('computer') + ' ' + i18n('opponent')]];
  const opponentOptions = opponents.map((a: Array<string>) => ({value: a[0], label: a[1]}));
  const aiLevelOptions = settings.search.aiLevels.map((a: string) => ({value: a, label: i18n('level') + ' ' + a}));
  const sourceOptions = settings.search.sources.map((a: Array<string>) => ({value: a[0], label: a[1]}));
  const perfOptions = settings.search.perfs.map((a: Array<string>) => ({value: a[0], label: a[1]}));
  const turnOptions = settings.search.turns.map((a: string) => ({value: a, label: a}));
  const durationOptions = settings.search.durations.map((a: Array<string>) => ({value: a[0], label: a[1]}));
  const timeOptions = settings.search.times.map((a: Array<string>) => ({value: a[0], label: a[1]}));
  const incrementOptions = settings.search.increments.map((a: Array<string>) => ({value: a[0], label: a[1]}));
  const resultOptions = settings.search.results.map((a: Array<string>) => ({value: a[0], label: a[1]}));
  const winnerOptions = settings.search.winners.map((a: Array<string>) => ({value: a[0], label: i18n(a[1])}));
  const dateOptions = settings.search.dates.map((a: Array<string>) => ({value: a[0], label: a[1]}));
  const sortFieldOptions = settings.search.sortFields.map((a: Array<string>) => ({value: a[0], label: a[1]}));
  const sortOrderOptions = settings.search.sortOrders.map((a: Array<string>) => ({value: a[0], label: a[1]}));
  const viewport = helper.viewportDim();
  const boardsize = (viewport.vw - 20) * 0.30;
  const boardBounds = { height: boardsize, width: boardsize };

  return (
    <div className="native_scroller searchWraper">
      <form id="advancedSearchForm"
      onsubmit={function(e: Event) {
        e.preventDefault();
        return ctrl.search(e.target as HTMLFormElement);
      }}>
          <div className="game_search_row">
            <label>Players: </label>
            <div className="game_search_input">
              <input type="text" id="players_a" name="players.a" onkeyup={(e: Event) => { redraw(); }} />
            </div>
            <div className="game_search_input">
              <input type="text" id="players_b" name="players.b" onkeyup={(e: Event) => { redraw(); }} />
            </div>
          </div>
          {renderSelectRow(i18n('white'), playersNonEmpty(), {name: 'players.white', options: getPlayers(), default: ''}, null)}
          {renderSelectRow(i18n('black'), playersNonEmpty(), {name: 'players.black', options: getPlayers(), default: ''}, null)}
          {renderSelectRow(i18n('winner'), playersNonEmpty(), {name: 'players.winner', options: getPlayers(), default: ''}, null)}
          {renderSelectRow(i18n('ratingRange'), true, {name: 'ratingMin', options: ratingOptions, default: 'From'}, {name: 'ratingMax', options: ratingOptions, default: 'To'})}
          {renderSelectRow(i18n('opponent'), true, {name: 'hasAi', options: opponentOptions, default: null, onchange: () => { redraw() }}, null)}
          {renderSelectRow(i18n('aiNameLevelAiLevel', 'A.I.', '').trim(), isComputerOpp(), {name: 'aiLevelMin', options: aiLevelOptions, default: 'From'}, {name: 'aiLevelMax', options: aiLevelOptions, default: 'To'})}
          {renderSelectRow('Source', true, {name: 'source', options: sourceOptions, default: null}, null)}
          {renderSelectRow(i18n('variant'), true, {name: 'perf', options: perfOptions, default: null}, null)}
          {renderSelectRow('Turns', true, {name: 'turnsMin', options: turnOptions, default: 'From'}, {name: 'turnsMax', options: turnOptions, default: 'To'})}
          {renderSelectRow(i18n('duration'), true, {name: 'durationMin', options: durationOptions, default: 'From'}, {name: 'durationMax', options: durationOptions, default: 'To'})}
          {renderSelectRow(i18n('time'), true, {name: 'clock.initMin', options: timeOptions, default: 'From'}, {name: 'clock.initMax', options: timeOptions, default: 'To'})}
          {renderSelectRow(i18n('increment'), true, {name: 'clock.incMin', options: incrementOptions, default: 'From'}, {name: 'clock.incMax', options: incrementOptions, default: 'To'})}
          {renderSelectRow('Result', true, {name: 'status', options: resultOptions, default: null}, null)}
          {renderSelectRow(i18n('winner'), true, {name: 'winnerColor', options: winnerOptions, default: null}, null)}
          {renderSelectRow('Date', true, {name: 'dateMin', options: dateOptions, default: 'From'}, {name: 'dateMax', options: dateOptions, default: 'To'})}
          {renderSelectRow('Sort', true, {name: 'sort.field', options: sortFieldOptions, default: 'From'}, {name: 'sort.order', options: sortOrderOptions, default: 'To'})}
          <div className="game_search_row">
            <label>Analysis?: </label>
            <div className="game_search_input double_wide">
              <input type="checkbox" id="analysed" name="analysed" value="1" />
            </div>
          </div>
        <button key="search" className="newGameButton" type="submit">
          <span className="fa fa-search" />
          {i18n('search')}
        </button>
      </form>
      {ctrl.result() ?
        <div className="searchGamesList">
          {ctrl.games().map((g: UserGameWithDate, index: number) => m(Game, { key: g.id, g, index, boardBounds, ctrl })) }
          {ctrl.result().paginator.nextPage ?
            <button key="more" className="newGameButton" oncreate={helper.ontap(() => ctrl.more())}>
              <span className="fa fa-search" />
              {i18n('more')}
            </button>
            : null}
        </div>
      : null }
    </div>
  );
}

function renderSelectRow(label: string, isDisplayed: boolean, select1: Select, select2: Select) {
  if(!isDisplayed) return null;

  return (
    <div className="game_search_row">
      <label>{label}: </label>
      <div className={'game_search_select' + (select2 ? '' : ' double_wide')}>
        <select id={select1.name.replace('.', '_')} name={select1.name} onchange={select1.onchange ? select1.onchange : ''}>
          <option selected value=""> {select1.default ? select1.default : ''} </option>
          {select1.options.map(renderOption)}
        </select>
      </div>
      {select2 ?
        <div className="game_search_select">
          <select id={select2.name.replace('.', '_')} name={select2.name} onchange={select1.onchange ? select1.onchange : ''}>
            <option selected value=""> {select2.default ? select2.default : ''} </option>
            {select2.options.map(renderOption)}
          </select>
        </div>
        : null }
    </div>
  )
}

function renderOption(opt: Option) {
  return (
    <option key={opt.value} value={opt.value}> {opt.label} </option>
  )
}

function getPlayers(): Array<Option> {
  const playerAEl = (document.getElementById('players_a') as HTMLInputElement);
  const playerBEl = (document.getElementById('players_b') as HTMLInputElement);
  if(!playerAEl || !playerBEl)
    return [];
  const playerA = playerAEl.value.trim();
  const playerB = playerBEl.value.trim();
  const players: Array<Option> = [];
  if (playerA) {
    players.push({value: playerA, label: playerA});
  }
  if (playerB) {
    players.push({value: playerB, label: playerB});
  }
  return players;
}

function playersNonEmpty() {
  return getPlayers().reduce((acc, cur) => acc + cur.label.length, 0) > 0;
}

function isComputerOpp() {
  const hasAi = (document.getElementById('hasAi') as HTMLInputElement);
  return hasAi && (hasAi.value === '1');
}

const Game: Mithril.Component<{ g: UserGameWithDate, index: number, boardBounds: {height: number, width: number}, ctrl: SearchState }, { boardTheme: string }> = {
  onbeforeupdate({ attrs }, { attrs: oldattrs }) {
    return attrs.g !== oldattrs.g
  },
  oninit() {
    this.boardTheme = settings.general.theme.board();
  },
  view({ attrs }) {
    const { g, index, boardBounds, ctrl } = attrs
    const time = gameApi.time(g);
    const mode = g.rated ? i18n('rated') : i18n('casual');
    const title = g.source === 'import' ?
    `Import • ${g.variant.name}` :
    `${time} • ${g.variant.name} • ${mode}`;
    const status = gameStatus.toLabel(g.status.name, g.winner, g.variant.key) +
      (g.winner ? '. ' + i18n(g.winner === 'white' ? 'whiteIsVictorious' : 'blackIsVictorious') + '.' : '');
    const icon = g.source === 'import' ? '/' : utils.gameIcon(g.perf) || '';
    const perspectiveColor = 'white';
    const evenOrOdd = index % 2 === 0 ? 'even' : 'odd';
    const star = g.bookmarked ? 't' : 's';
    const withStar = session.isConnected() ? ' withStar' : '';
    return (
      <li data-id={g.id} className={`userGame ${evenOrOdd}${withStar}`} oncreate={helper.ontap(e => onTap(e, g, ctrl.bookmark))}>
        {renderBoard(g.fen, perspectiveColor, boardBounds, this.boardTheme)}
        <div className="userGame-infos">
          <div className="userGame-versus">
            <span className="variant-icon" data-icon={icon} />
          <div className="game-result">
        <div className="userGame-players">
          {renderPlayer(g.players, 'white')}
          <div className="swords" data-icon="U" />
          {renderPlayer(g.players, 'black')}
          </div>
          <div className={helper.classSet({
            'userGame-status': true,
            win: perspectiveColor === g.winner,
            loose: g.winner && perspectiveColor !== g.winner
          })}>{status}</div>
          </div>
        </div>
        <div className="userGame-meta">
          <p className="game-infos">
          {g.date} • {title}
          </p>
          {g.opening ?
            <p className="opening">{g.opening.name}</p> : null
          }
          {g.analysed ?
            <p className="analysis">
            <span className="fa fa-bar-chart" />
            Computer analysis available
            </p> : null
          }
          </div>
        </div>
        { session.isConnected() ?
          <button className="iconStar" data-icon={star} /> : null
        }
      </li>
    );
  }
}

function onTap (e: Event, g: UserGameWithDate, bookmark: (id: string) => void) {
  const starButton = getButton(e);
  if (starButton) {
    bookmark(g.id);
  }
  else {
    router.set('/game/' + g.id);
  }
}
