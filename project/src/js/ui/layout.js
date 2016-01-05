import menu from './menu';
import gamesMenu from './gamesMenu';
import newGameForm from './newGameForm';
import challengeForm from './challengeForm';
import loginModal from './loginModal';
import signupModal from './signupModal';
import friendsPopup from './friendsPopup';
import lobby from './lobby';
import helper from './helper';
import settings from '../settings';

export default {

  board: function(header, content, overlay, color = '') {
    return (
      <div className={'view-container ' + settings.general.theme.background()}>
        <main id="page" className={color}>
          <header className="main_header board">
            {header()}
          </header>
          <div className="content_round">{content()}</div>
          { menu.isOpen ? <div className="menu-close-overlay" config={helper.ontouch(menu.close)} /> : null }
        </main>
        {menu.view()}
        {gamesMenu.view()}
        {loginModal.view()}
        {signupModal.view()}
        {newGameForm.view()}
        {challengeForm.view()}
        {friendsPopup.view()}
        {lobby.view()}
        {overlay ? overlay() : null}
      </div>
    );
  },

  free: function(header, content, footer, overlay) {
    return (
      <div className={'view-container ' + settings.general.theme.background()}>
        <main id="page">
          <header className="main_header">{header()}</header>
          <div className="content">{content()}</div>
          <footer className="main_footer">{footer()}</footer>
          { menu.isOpen ? <div className="menu-close-overlay" config={helper.ontouch(menu.close)} /> : null }
        </main>
        {menu.view()}
        {gamesMenu.view()}
        {loginModal.view()}
        {signupModal.view()}
        {newGameForm.view()}
        {challengeForm.view()}
        {friendsPopup.view()}
        {overlay ? overlay() : null}
      </div>
    );
  }
};
