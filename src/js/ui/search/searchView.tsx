import * as h from 'mithril/hyperscript'
import * as throttle from 'lodash/throttle'
import * as m from 'mithril'
import router from '../../router'
import i18n from '../../i18n'
import redraw from '../../utils/redraw'

import * as helper from '../helper'
import GameItem from '../shared/GameItem'

import { ISearchCtrl } from './searchCtrl'
import { SearchResult, UserGameWithDate } from './interfaces'

interface SearchSelect {
  name: string
  options: SearchOption[]
  placeholder?: string
  default?: string
  onchange?: () => void
}

interface SearchOption {
  value: string
  label: string
}

export function renderSearchForm(ctrl: ISearchCtrl) {
  return (
    <div id="searchContent" className="native_scroller searchWraper">
      <form id="advancedSearchForm"
        onsubmit={function(e: Event) {
          e.preventDefault()
          const analysed = document.getElementById('analysed') as HTMLInputElement
          analysed.value = analysed.checked ? '1' : ''
          return ctrl.search(e.target as HTMLFormElement)
        }}
      >
        <div className="game_search_row">
          <label>Players</label>
          <div className="game_search_input">
            <input type="text" id="players_a" name="players.a" oninput={throttledRedraw} />
          </div>
          <div className="game_search_input">
            <input type="text" id="players_b" name="players.b" oninput={throttledRedraw} />
          </div>
        </div>
        {renderSelectRow(i18n('white'), playersNonEmpty(), { name: 'players.white', options: getPlayers(), default: ''})}
        {renderSelectRow(i18n('black'), playersNonEmpty(), { name: 'players.black', options: getPlayers(), default: ''})}
        {renderSelectRow(i18n('winner'), playersNonEmpty(), { name: 'players.winner', options: getPlayers(), default: ''})}
        {renderSelectRow(i18n('ratingRange'), true, { name: 'ratingMin', options: ratingOptions, default: '', placeholder: 'From'}, {name: 'ratingMax', options: ratingOptions, default: '', placeholder: 'To'})}
        {renderSelectRow(i18n('opponent'), true, { name: 'hasAi', options: opponentOptions, default: '', onchange: () => { redraw() }})}
        {renderSelectRow(i18n('aiNameLevelAiLevel', 'A.I.', '').trim(), isComputerOpp(), {name: 'aiLevelMin', options: aiLevelOptions, default: '', placeholder: 'From'}, { name: 'aiLevelMax', options: aiLevelOptions, default: '', placeholder: 'To'})}
        {renderSelectRow('Source', true, { name: 'source', options: sourceOptions, default: ''})}
        {renderSelectRow(i18n('variant'), true, { name: 'perf', options: perfOptions, default: ''})}
        {renderSelectRow('Turns', true, { name: 'turnsMin', options: turnOptions, default: '', placeholder: 'From'}, {name: 'turnsMax', options: turnOptions, default: '', placeholder: 'To'})}
        {renderSelectRow(i18n('duration'), true, { name: 'durationMin', options: durationOptions, default: '', placeholder: 'From'}, {name: 'durationMax', options: durationOptions, default: '', placeholder: 'To'})}
        {renderSelectRow(i18n('time'), true, { name: 'clock.initMin', options: timeOptions, default: '', placeholder: 'From'}, {name: 'clock.initMax', options: timeOptions, default: '', placeholder: 'To'})}
        {renderSelectRow(i18n('increment'), true, { name: 'clock.incMin', options: incrementOptions, default: '', placeholder: 'From'}, {name: 'clock.incMax', options: incrementOptions, default: '', placeholder: 'To'})}
        {renderSelectRow('Result', true, { name: 'status', options: resultOptions, default: ''})}
        {renderSelectRow(i18n('winner'), true, {name: 'winnerColor', options: winnerOptions, default: ''})}
        {renderSelectRow('Date', true, { name: 'dateMin', options: dateOptions, default: '', placeholder: 'From'}, {name: 'dateMax', options: dateOptions, default: '', placeholder: 'To'})}
        {renderSelectRow('Sort', true, { name: 'sort.field', options: sortFieldOptions }, {name: 'sort.order', options: sortOrderOptions })}
        <div className="game_search_row">
          <label>Analysis</label>
          <div className="game_search_input double_wide">
            <input type="checkbox" id="analysed" name="analysed" value="" />
          </div>
        </div>
        <button key="search" className="fatButton" type="submit">
          <span className="fa fa-search" />
          {i18n('search')}
        </button>
      </form>
      { ctrl.result() && ctrl.games() ?
        renderResult(ctrl, ctrl.result(), ctrl.games()) : null
      }
    </div>
  )
}

interface GameDataSet extends DOMStringMap {
  id: string
}
function onTap (ctrl: ISearchCtrl, e: Event) {
  const starButton = helper.getButton(e)
  const el = helper.getLI(e)
  const id = el && (el.dataset as GameDataSet).id
  if (starButton) {
    ctrl.toggleBookmark(id)
  } else {
    if (id) {
      const g = ctrl.games().find(game => game.id === id)
      if (g) {
        router.set(`/analyse/online/${id}`)
      }
    }
  }
}

function renderResult(ctrl: ISearchCtrl, result: SearchResult, games: UserGameWithDate[]) {
  if (games.length === 0) {
    return h('div.searchGamesList', [
      h('div.search-empty', 'No game found')
    ])
  }

  return h('div.searchGamesList', {
    oncreate: helper.ontapY(e => onTap(ctrl, e!), undefined, helper.getLI)
  }, [
    games.map((g: UserGameWithDate, index: number) =>
      m(GameItem, { key: g.id, g, index, boardTheme: ctrl.boardTheme })
    ),
    result.paginator && result.paginator.nextPage ?
      h('button.fatButton', {
        key: 'more',
        oncreate: helper.ontap(ctrl.more)
      }, h('span.fa.fa-arrow-down')) : null
  ])
}

function renderSelectRow(label: string, isDisplayed: boolean, select1: SearchSelect, select2?: SearchSelect) {
  if (!isDisplayed) return null

  return (
    <div className="game_search_row">
      <label>{label}</label>
      <div className={'game_search_select' + (select2 ? '' : ' double_wide')}>
        <label></label>
        <select id={select1.name.replace('.', '_')} name={select1.name} onchange={select1.onchange ? select1.onchange : ''}>
          { select1.placeholder !== undefined ?
            <option value="" selected disabled> {select1.placeholder} </option> :
            null
          }
          { select1.default !== undefined ?
            <option value=""> {select1.default} </option> :
            null
          }
          {select1.options.map(renderOption)}
        </select>
      </div>
      {select2 ?
        <div className="game_search_select">
          <label></label>
          <select id={select2.name.replace('.', '_')} name={select2.name} onchange={select1.onchange ? select1.onchange : ''}>
            { select2.placeholder !== undefined ?
              <option value="" selected disabled> {select2.placeholder} </option> :
              null
            }
            { select2.default !== undefined ?
              <option value=""> {select2.default} </option> :
              null
            }
            {select2.options.map(renderOption)}
          </select>
        </div>
        : null }
    </div>
  )
}

function renderOption(opt: SearchOption) {
  return (
    <option key={opt.value} value={opt.value}> {opt.label} </option>
  )
}

function getPlayers(): Array<SearchOption> {
  const playerAEl = (document.getElementById('players_a') as HTMLInputElement)
  const playerBEl = (document.getElementById('players_b') as HTMLInputElement)
  if (!playerAEl || !playerBEl)
    return []
  const playerA = playerAEl.value.trim()
  const playerB = playerBEl.value.trim()
  const players: Array<SearchOption> = []
  if (playerA) {
    players.push({value: playerA, label: playerA})
  }
  if (playerB) {
    players.push({value: playerB, label: playerB})
  }
  return players
}

function playersNonEmpty() {
  return getPlayers().reduce((acc, cur) => acc + cur.label.length, 0) > 0
}

function isComputerOpp() {
  const hasAi = (document.getElementById('hasAi') as HTMLInputElement)
  return hasAi && (hasAi.value === '1')
}

const throttledRedraw = throttle(redraw, 300)

const searchOpts = {
  ratings: ['800', '900', '1000', '1100', '1200', '1300', '1400', '1500', '1600', '1700', '1800', '1900', '2000', '2100', '2200', '2300', '2400', '2500', '2600', '2700', '2800', '2900'],
  aiLevels: ['1', '2', '3', '4', '5', '6', '7', '8'],
  sources: [['1', 'Lobby'], ['2', 'Friend'], ['3', 'Ai'], ['6', 'Position'], ['7', 'Import'], ['5', 'Tournament'], ['10', 'Simul'], ['12', 'Pool']],
  perfs: [['1', 'Bullet'], ['2', 'Blitz'], ['3', 'Classical'], ['4', 'Correspondence'], ['18', 'Crazyhouse'], ['11', 'Chess960'], ['12', 'King of the Hill'], ['15', 'Three-check'], ['13', 'Anticheck'], ['14', 'Atomic'], ['16', 'Horde'], ['17', 'Racing Kings']],
  turns: ['1', '2', '3', '4', '5', '10', '15', '20', '25', '30', '35', '40', '45', '50', '60', '70', '80', '90', '100', '125', '150', '175', '200', '225', '250', '275', '300'],
  durations: [['30', '30 seconds'], ['60', '1 minute'], ['120', '2 minutes'], ['300', '5 minutes'], ['600', '10 minutes'], ['900', '15 minutes'], ['1200', '20 minutes'], ['1800', '30 minutes'], ['3600', '1 hour'], ['10800', '3 hours'], ['86400', '1 day'], ['259200', '3 days'], ['604800', '1 week'], ['1209600', '2 weeks'], ['2592000', '1 month'], ['7776000', '3 months'], ['15552000', '6 months'], ['31536000', '1 year']],
  times: [['0', '0 seconds'], ['30', '30 seconds'], ['45', '45 seconds'], ['60', '1 minute'], ['120', '2 minutes'], ['180', '3 minutes'], ['300', '5 minutes'], ['600', '10 minutes'], ['900', '15 minutes'], ['1200', '20 minutes'], ['1800', '30 minutes'], ['2700', '45 minutes'], ['3600', '60 minutes'], ['5400', '90 minutes'], ['7200', '120 minutes'], ['9000', '150 minutes'], ['10800', '180 minutes']],
  increments: [['0', '0 seconds'], ['1', '1 second'], ['2', '2 seconds'], ['3', '3 seconds'], ['5', '5 seconds'], ['10', '10 seconds'], ['15', '15 seconds'], ['30', '30 seconds'], ['45', '45 seconds'], ['60', '60 seconds'], ['90', '90 seconds'], ['120', '120 seconds'], ['150', '150 seconds'], ['180', '180 seconds']],
  results: [['30', 'Mate'], ['31', 'Resign'], ['32', 'Stalemate'], ['34', 'Draw'], ['35', 'Clock Flag'], ['60', 'Variant End']],
  winners: [['1', 'white'], ['2', 'black'], ['3', 'none']],
  dates: [['0d', 'Now'], ['1h', '1 hour ago'], ['2h', '2 hours ago'], ['6h', '6 hours ago'], ['1d', '1 day ago'], ['2d', '2 days ago'], ['3d', '3 days ago'], ['4d', '4 days ago'], ['5d', '5 days ago'], ['6d', '6 days ago'], ['1w', '1 week ago'], ['2w', '2 weeks ago'], ['3w', '3 weeks ago'], ['4w', '4 weeks ago'], ['5w', '5 weeks ago'], ['6w', '6 weeks ago'], ['1m', '1 month ago'], ['2m', '2 months ago'], ['3m', '3 months ago'], ['4m', '4 months ago'], ['5m', '5 months ago'], ['6m', '6 months ago'], ['1y', '1 year ago'], ['2y', '2 years ago'], ['3y', '3 years ago'], ['4y', '4 years ago'], ['5y', '5 years ago']],
  sortFields: [['d', 'Date'], ['t', 'Moves'], ['a', 'Rating']],
  sortOrders: [['desc', 'Descending'], ['asc', 'Ascending']]
}

const ratingOptions = searchOpts.ratings.map((a: string) => ({value: a, label: a}))
const opponents = [['0', i18n('human') + ' ' + i18n('opponent')], ['1', i18n('computer') + ' ' + i18n('opponent')]]
const opponentOptions = opponents.map((a: Array<string>) => ({value: a[0], label: a[1]}))
const aiLevelOptions = searchOpts.aiLevels.map((a: string) => ({value: a, label: i18n('level') + ' ' + a}))
const sourceOptions = searchOpts.sources.map((a: Array<string>) => ({value: a[0], label: a[1]}))
const perfOptions = searchOpts.perfs.map((a: Array<string>) => ({value: a[0], label: a[1]}))
const turnOptions = searchOpts.turns.map((a: string) => ({value: a, label: a}))
const durationOptions = searchOpts.durations.map((a: Array<string>) => ({value: a[0], label: a[1]}))
const timeOptions = searchOpts.times.map((a: Array<string>) => ({value: a[0], label: a[1]}))
const incrementOptions = searchOpts.increments.map((a: Array<string>) => ({value: a[0], label: a[1]}))
const resultOptions = searchOpts.results.map((a: Array<string>) => ({value: a[0], label: a[1]}))
const winnerOptions = searchOpts.winners.map((a: Array<string>) => ({value: a[0], label: i18n(a[1])}))
const dateOptions = searchOpts.dates.map((a: Array<string>) => ({value: a[0], label: a[1]}))
const sortFieldOptions = searchOpts.sortFields.map((a: Array<string>) => ({value: a[0], label: a[1]}))
const sortOrderOptions = searchOpts.sortOrders.map((a: Array<string>) => ({value: a[0], label: a[1]}))
