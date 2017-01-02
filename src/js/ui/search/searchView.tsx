import { header as headerWidget, backButton as renderBackbutton } from '../shared/common';
import layout from '../layout';
import i18n from '../../i18n';
import {SearchState, Option} from './interfaces';
import redraw from '../../utils/redraw';
import settings from '../../settings';

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
  const sourceOptions = settings.search.sources.map((a: Array<string>) => ({value: a[0], label: a[1]}));
  const perfOptions = settings.search.perfs.map((a: Array<string>) => ({value: a[0], label: a[1]}));
  const turnOptions = settings.search.turns.map((a: string) => ({value: a, label: a}));
  const durationOptions = settings.search.durations.map((a: Array<string>) => ({value: a[0], label: a[1]}));
  const timeOptions = settings.search.times.map((a: Array<string>) => ({value: a[0], label: a[1]}));
  const incrementOptions = settings.search.increments.map((a: Array<string>) => ({value: a[0], label: a[1]}));
  const resultOptions = settings.search.results.map((a: Array<string>) => ({value: a[0], label: a[1]}));
  const winnerOptions = settings.search.winners.map((a: Array<string>) => ({value: a[0], label: i18n(a[1])}));
  const dateOptions = settings.search.dates.map((a: Array<string>) => ({value: a[0], label: a[1]}));
  return (
    <form id="advancedSearchForm"
    onsubmit={function(e: Event) {
      e.preventDefault();
      return ctrl.search(e.target as HTMLFormElement);
    }}>
        <div className="game_search_row">
          <label>Players: </label>
          <div className="game_search_input">
            <input type="text" id="players.a" name="players_a" onkeyup={(e: Event) => { redraw(); }} />
          </div>
          <div className="game_search_input">
            <input type="text" id="players.b" name="players_b" onkeyup={(e: Event) => { redraw(); }} />
          </div>
        </div>
        {renderSelectRow(i18n('white'), playersNonEmpty(), 'players.white', getPlayers(), null, null)}
        {renderSelectRow(i18n('black'), playersNonEmpty(), 'players.black', getPlayers(), null, null)}
        {renderSelectRow(i18n('winner'), playersNonEmpty(), 'players.winner', getPlayers(), null, null)}
        {renderSelectRow(i18n('ratingRange'), true, 'ratingMin', ratingOptions, 'ratingMax', ratingOptions)}
        {renderSelectRow(i18n('opponent'), true, 'hasAi', opponentOptions, null, null)}
        {renderSelectRow('Source', true, 'source', sourceOptions, null, null)}
        {renderSelectRow(i18n('variant'), true, 'perf', perfOptions, null, null)}
        {renderSelectRow('Turns', true, 'turnsMin', turnOptions, 'turnsMax', turnOptions)}
        {renderSelectRow(i18n('duration'), true, 'durationMin', durationOptions, 'durationMax', durationOptions)}
        {renderSelectRow(i18n('time'), true, 'clock.initMin', timeOptions, 'clock.initMax', timeOptions)}
        {renderSelectRow(i18n('increment'), true, 'clock.incMin', incrementOptions, 'clock.incMax', incrementOptions)}
        {renderSelectRow('Result', true, 'status', resultOptions, null, null)}
        {renderSelectRow(i18n('winner'), true, 'winnerColor', winnerOptions, null, null)}
        {renderSelectRow('Date', true, 'dateMin', dateOptions, 'dateMax', dateOptions)}
        <div className="game_search_row">
          <label>Analysis?: </label>
          <div className="game_search_input double_wide">
            <input type="checkbox" id="analysed" name="analysed" value="1" />
          </div>
        </div>
      <button key="create" className="newGameButton" type="submit">
        <span className="fa fa-search" />
        {i18n('search')}
      </button>
    </form>
  );
}

function renderSelectRow(label: string, isDisplayed: boolean, name1: string, options1: Array<{value: string, label: string}>, name2: string, options2: Array<{value: string, label: string}> ) {
  if(!isDisplayed) return null;

  return (
    <div className="game_search_row">
      <label>{label}: </label>
      <div className={'game_search_select' + (name2 ? '' : ' double_wide')}>
        <select id={name1.replace('.', '_')} name={name1}>
          <option> </option>
          {options1.map(renderOption)}
        </select>
      </div>
      {name2 ?
        <div className="game_search_select">
          <select id={name2.replace('.', '_')} name={name2}>
            <option> </option>
            {options2.map(renderOption)}
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
  const playerAEl = (document.getElementById('players.a') as HTMLInputElement);
  const playerBEl = (document.getElementById('players.b') as HTMLInputElement);
  if(!playerAEl || !playerBEl)
    return [];
  const playerA = playerAEl.value.trim();
  const playerB = playerBEl.value.trim();
  const players: Array<Option> = [{value: null, label: ''}];
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
