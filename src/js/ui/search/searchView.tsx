import { header as headerWidget, backButton as renderBackbutton } from '../shared/common';
import layout from '../layout';
import i18n from '../../i18n';
import {SearchState, Select, Option} from './interfaces';
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
  const sortFieldOptions = settings.search.sortFields.map((a: Array<string>) => ({value: a[0], label: a[1]}));
  const sortOrderOptions = settings.search.sortOrders.map((a: Array<string>) => ({value: a[0], label: a[1]}));
  return (
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
        {renderSelectRow(i18n('white'), playersNonEmpty(), {name: 'players.white', options: getPlayers(), default: null}, null)}
        {renderSelectRow(i18n('black'), playersNonEmpty(), {name: 'players.black', options: getPlayers(), default: null}, null)}
        {renderSelectRow(i18n('winner'), playersNonEmpty(), {name: 'players.winner', options: getPlayers(), default: null}, null)}
        {renderSelectRow(i18n('ratingRange'), true, {name: 'ratingMin', options: ratingOptions, default: 'From'}, {name: 'ratingMax', options: ratingOptions, default: 'To'})}
        {renderSelectRow(i18n('opponent'), true, {name: 'hasAi', options: opponentOptions, default: null}, null)}
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
      <button key="create" className="newGameButton" type="submit">
        <span className="fa fa-search" />
        {i18n('search')}
      </button>
    </form>
  );
}

function renderSelectRow(label: string, isDisplayed: boolean, select1: Select, select2: Select) {
  if(!isDisplayed) return null;

  return (
    <div className="game_search_row">
      <label>{label}: </label>
      <div className={'game_search_select' + (select2 ? '' : ' double_wide')}>
        <select id={select1.name.replace('.', '_')} name={select1.name}>
          <option selected> {select1.default ? select1.default : ''} </option>
          {select1.options.map(renderOption)}
        </select>
      </div>
      {select2 ?
        <div className="game_search_select">
          <select id={select2.name.replace('.', '_')} name={select2.name}>
            <option selected> {select2.default ? select2.default : ''} </option>
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
