import * as menu from './menu';
import menuView from './menu/menuView';
import gamesMenu from './gamesMenu';
import newGameForm from './newGameForm';
import playMachineForm from './playMachineForm';
import challengeForm from './challengeForm';
import loginModal from './loginModal';
import signupModal from './signupModal';
import friendsPopup from './friendsPopup';
import lobby from './lobby';
import * as helper from './helper';
import settings from '../settings';

let background: string;

export default {

  onBackgroundChange: function(bg: string) {
    background = bg;
  },

  empty() {
    background = background || settings.general.theme.background();
    return (
      <div className={'view-container ' + background}>
        <main id="page">
        </main>
      </div>
    );
  },

  board(
    header: () => Mithril.Children,
    content: () => Mithril.Children,
    overlay?: () => Mithril.Children,
    color?: string
  ) {
    background = background || settings.general.theme.background();
    return (
      <div className={'view-container ' + background}>
        <main id="page" className={color}>
          <header className="main_header board">
            {header()}
          </header>
          <div id="content_round" className="content_round">{content()}</div>
          { menu.isOpen() ? <div className="menu-close-overlay" oncreate={helper.ontap(() => menu.close())} /> : null }
        </main>
        {menuView()}
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
    );
  },

  free(
    header: () => Mithril.Children,
    content: () => Mithril.Children,
    footer?: () => Mithril.Children,
    overlay?: () => Mithril.Children
  ) {
    background = background || settings.general.theme.background();
    return (
      <div className={'view-container ' + background}>
        <main id="page">
          <header className="main_header">
            {header()}
          </header>
          <div id="free_content" className={'content' + (footer ? ' withFooter' : '')}>
            {content()}
          </div>
          { footer ? <footer className="main_footer">{footer()}</footer> : null }
          { menu.isOpen() ? <div className="menu-close-overlay" oncreate={helper.ontap(() => menu.close())} /> : null }
        </main>
        {menuView()}
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
    );
  },

  clock(content: () => Mithril.Children, overlay?: () => Mithril.Children) {
    background = background || settings.general.theme.background();
    return (
      <div className={'view-container ' + background}>
        <main id="page">
          <div className="content fullScreen">
            {content()}
          </div>
          { menu.isOpen() ? <div className="menu-close-overlay" oncreate={helper.ontap(() => menu.close())} /> : null }
        </main>
        {overlay ? overlay() : null}
      </div>
    );
  }
};
