import * as h from 'mithril/hyperscript'
import settings from '../settings'
import * as menu from './menu'
import MenuOpenSlideHandler from './menu/OpenSlideHandler'
import MenuView from './menu/menuView'
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
    return (
      <div className={'view-container ' + bgClass(background)}>
        <main id="page" className={color}
          oncreate={({ dom }: Mithril.DOMNode) => {
            MenuOpenSlideHandler(dom as HTMLElement)
          }}
        >
          <header className="main_header board">
            {header()}
          </header>
          <div id="content_round" className="content_round">{content()}</div>
          <div id="menu-close-overlay" oncreate={menu.backdropCloseHandler} />
        </main>
        {h(MenuView)}
        {gamesMenu.view()}
        {loginModal.view()}
        {signupModal.view()}
        {newGameForm.view()}
        {playMachineForm.view()}
        {challengeForm.view()}
        {friendsPopup.view()}
        {lobby.view()}
        {overlay ? overlay() : null}
      </div>
    )
  },

  free(
    header: () => Mithril.Children,
    content: () => Mithril.Children,
    footer?: () => Mithril.Children,
    overlay?: () => Mithril.Children
  ) {
    background = background || settings.general.theme.background()
    return (
      <div className={'view-container ' + bgClass(background)}>
        <main id="page"
          oncreate={({ dom }: Mithril.DOMNode) => {
            MenuOpenSlideHandler(dom as HTMLElement)
          }}
        >
          <header className="main_header">
            {header()}
          </header>
          <div id="free_content" className={'content' + (footer ? ' withFooter' : '')}>
            {content()}
          </div>
          { footer ? <footer className="main_footer">{footer()}</footer> : null }
          <div id="menu-close-overlay" oncreate={menu.backdropCloseHandler} />
        </main>
        {h(MenuView)}
        {gamesMenu.view()}
        {loginModal.view()}
        {signupModal.view()}
        {newGameForm.view()}
        {playMachineForm.view()}
        {challengeForm.view()}
        {friendsPopup.view()}
        {lobby.view()}
        {overlay ? overlay() : null}
      </div>
    )
  },

  clock(content: () => Mithril.Children, overlay?: () => Mithril.Children) {
    background = background || settings.general.theme.background()
    return (
      <div className={'view-container ' + background}>
        <main id="page">
          <div className="content fullScreen">
            {content()}
          </div>
          <div id="menu-close-overlay" oncreate={menu.backdropCloseHandler} />
        </main>
        {overlay ? overlay() : null}
      </div>
    )
  }
}

function bgClass(bgTheme: string) {
  return bgTheme === 'dark' || bgTheme === 'light' ? bgTheme : 'transp ' + bgTheme
}
