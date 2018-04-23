import * as stream from 'mithril/stream'
import * as throttle from 'lodash/throttle'
import redraw from '../../utils/redraw'
import * as utils from '../../utils'
import router from '../../router'
import { User } from '../../lichess/interfaces/user'
import * as xhr from './playerXhr'

export interface IPlayersCtrl {
  players: Mithril.Stream<Array<User>>
  isSearchOpen: Mithril.Stream<boolean>
  searchResults: Mithril.Stream<string[]>
  onInput: (e: Event) => void
  closeSearch: (fbb?: string) => void
  goSearch(): void
  goToProfile(u: string): void
  onKeyboardShow(e: Ionic.KeyboardEvent): void,
  onKeyboardHide(): void
  unload(): void
}

export default function PlayersCtrl(): IPlayersCtrl {

  const isSearchOpen = stream(false)
  const searchResults: Mithril.Stream<string[]> = stream([])
  const players: Mithril.Stream<User[]> = stream([])
  let listHeight: number

  function onKeyboardShow(e: Ionic.KeyboardEvent) {
    if (window.cordova.platformId === 'ios') {
      let ul = document.getElementById('players_search_results')
      if (ul) {
        listHeight = ul.offsetHeight
        ul.style.height = (listHeight - e.keyboardHeight) + 'px'
      }
    }
  }

  function onKeyboardHide() {
    if (window.cordova.platformId === 'ios') {
      let ul = document.getElementById('players_search_results')
      if (ul) ul.style.height = listHeight + 'px'
    }
    let input = document.getElementById('searchPlayers')
    if (input) input.blur()
  }

  function closeSearch(fromBB?: string) {
    if (fromBB !== 'backbutton' && isSearchOpen()) router.backbutton.stack.pop()
      isSearchOpen(false)
  }

  function unload() {
    window.removeEventListener('keyboardDidShow', onKeyboardShow)
    window.removeEventListener('keyboardDidHide', onKeyboardHide)
  }

  window.addEventListener('keyboardDidShow', onKeyboardShow)
  window.addEventListener('keyboardDidHide', onKeyboardHide)

  xhr.onlinePlayers()
  .then(data => {
    players(data)
    redraw()
  })
  .catch(utils.handleXhrError)

  return {
    players,
    isSearchOpen,
    searchResults,
    onInput: throttle((e: Event) => {
      const term = (e.target as HTMLInputElement).value.trim()
      if (term.length >= 3)
        xhr.autocomplete(term).then(data => {
          searchResults(data)
          redraw()
        })
    }, 250),
    closeSearch,
    goSearch() {
      router.backbutton.stack.push(closeSearch)
      isSearchOpen(true)
    },
    goToProfile(u) {
      router.set('/@/' + u)
    },
    onKeyboardShow,
    onKeyboardHide,
    unload
  }
}
