import * as h from 'mithril/hyperscript'
import settings from '../settings'
import gamesMenu from './gamesMenu'
import newGameForm from './newGameForm'
import playMachineForm from './playMachineForm'
import challengeForm from './challengeForm'
import loginModal from './loginModal'
import signupModal from './signupModal'
import friendsPopup from './friendsPopup'
import lobby from './lobby'

let background: string

export default {

  onBackgroundChange: function(bg: string) {
    background = bg
  },

  board(
    header: () => Mithril.Children,
    content: () => Mithril.Children,
    overlay?: () => Mithril.Children,
    color?: string
  ) {
    background = background || settings.general.theme.background()
    return h('div.view-container', { className: bgClass(background) }, [
      h('main#page', {
        className: color,
      }, [
        h('header.main_header.board', header()),
        h('div.content_round', content()),
      ]),
      gamesMenu.view(),
      loginModal.view(),
      signupModal.view(),
      newGameForm.view(),
      playMachineForm.view(),
      challengeForm.view(),
      friendsPopup.view(),
      lobby.view(),
      overlay ? overlay() : null
    ])
  },

  free(
    header: () => Mithril.Children,
    content: () => Mithril.Children,
    footer?: () => Mithril.Children,
    overlay?: () => Mithril.Children
  ) {
    background = background || settings.general.theme.background()
    return h('div.view-container', { className: bgClass(background) }, [
      h('main#page', [
        h('header.main_header', header()),
        h('div#free_content.content', content()),
        footer ? h('footer.main_footer', footer()) : null,
      ]),
      gamesMenu.view(),
      loginModal.view(),
      signupModal.view(),
      newGameForm.view(),
      playMachineForm.view(),
      challengeForm.view(),
      friendsPopup.view(),
      lobby.view(),
      overlay ? overlay() : null
    ])
  },

  clock(content: () => Mithril.Children, overlay?: () => Mithril.Children) {
    background = background || settings.general.theme.background()
    return h('div.view-container', { className: bgClass(background) }, [
      h('main#page', [
        h('div.content.standaloneClock', content())
      ]),
      overlay ? overlay() : null
    ])
  }
}

function bgClass(bgTheme: string) {
  return bgTheme === 'dark' || bgTheme === 'light' ? bgTheme : 'transp ' + bgTheme
}
