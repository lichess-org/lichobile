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
    const mainClass = [
      menu.isOpen ? 'out' : 'in',
      color
    ].join(' ');
    return (
      <div className={'view-container ' + settings.general.theme.background()}>
        <main id="page" className={mainClass}>
          <header className="main_header board">
            {header()}
          </header>
          <div className="content round">{content()}</div>
          <div className="menu-close-overlay" config={helper.ontouch(menu.close)} />
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
    const mainClass = [
      menu.isOpen ? 'out' : 'in'
    ].join(' ');
    return (
      <div className={'view-container ' + settings.general.theme.background()}>
        <main id="page" className={mainClass}>
          <header className="main_header">{header()}</header>
          <div className="content">{content()}</div>
          <footer className="main_footer">{footer()}</footer>
          <div className="menu-close-overlay" config={helper.ontouch(menu.close)} />
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
