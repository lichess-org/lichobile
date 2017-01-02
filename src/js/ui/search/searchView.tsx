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
  const ratingOptions = settings.search.ratings.map((rating: string) => ({value: rating, label: rating}));
  ratingOptions.unshift({value: null, label:''});
  const opponentOptions = settings.search.opponents.map((opp: Array<string>) => ({value: opp[0], label: opp[1]}));
  opponentOptions.unshift({value: null, label:''});
  const sourceOptions = settings.search.sources.map((source: Array<string>) => ({value: source[0], label: source[1]}));
  sourceOptions.unshift({value: null, label:''});
  // const ratingOptions = settings.search.ratingOptions;
  return (
    <form id="advancedSearchForm"
    onsubmit={function(e: Event) {
      e.preventDefault();
      return ctrl.search(e.target as HTMLFormElement);
    }}>
        <div className="game_search_row">
          <label>Players: </label>
          <div className="game_search_input">
            <input type="text" id="players.a" name="players_a" onkeyup={(e: Event) => { redraw(); }}/>
          </div>
          <div className="game_search_input">
            <input type="text" id="players.b" name="players_b" onkeyup={(e: Event) => { redraw(); }}/>
          </div>
        </div>
        {renderSelectRow('White', playersNonEmpty(), 'players.white', getPlayers(), null, null)}
        {renderSelectRow('Black', playersNonEmpty(), 'players.black', getPlayers(), null, null)}
        {renderSelectRow('Winner', playersNonEmpty(), 'players.winner', getPlayers(), null, null)}
        {renderSelectRow('Rating Range', true, 'ratingMin', ratingOptions, 'ratingMax', ratingOptions)}
        {renderSelectRow('Opponent', true, 'hasAi', opponentOptions, null, null)}
        {renderSelectRow('Source', true, 'source', sourceOptions, null, null)}
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
          {options1.map(renderOption)}
        </select>
      </div>
      {name2 ?
        <div className="game_search_select">
          <select id={name2.replace('.', '_')} name={name2}>
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
