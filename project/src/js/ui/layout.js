/** @jsx m */
import menu from './menu';
import gamesMenu from './gamesMenu';
import newGameForm from './newGameForm';
import challengeForm from './challengeForm';
import loginModal from './loginModal';
import signupModal from './signupModal';
import friendsPopup from './friendsPopup';
import helper from './helper';

export default {

  board: function(header, content, overlay) {
    const mainClass = [
      menu.isOpen ? 'out' : 'in'
    ].join(' ');
    return (
      <div className="view-container">
        <main id="page" className={mainClass}>
          <header className="main_header board">
            {header()}
          </header>
          {content()}
          <div className="menu-close-overlay" config={helper.ontouch(menu.close)} />
          {menu.view()}
          {gamesMenu.view()}
          {loginModal.view()}
          {signupModal.view()}
          {newGameForm.view()}
          {challengeForm.view()}
          {friendsPopup.view()}
          {overlay ? overlay() : null}
        </main>
      </div>
    );
  },

  free: function(header, content, footer, overlay) {
    return (
      <div className="view-container">
        <main id="page" className={menu.isOpen ? 'out' : 'in'}>
          <header className="main_header">{header()}</header>
          <div className="content" config={helper.scale}>{content()}</div>
          <footer className="main_footer">{footer()}</footer>
          <div className="menu-close-overlay" config={helper.ontouch(menu.close)} />
          {menu.view()}
          {gamesMenu.view()}
          {loginModal.view()}
          {signupModal.view()}
          {newGameForm.view()}
          {challengeForm.view()}
          {friendsPopup.view()}
          {overlay ? overlay() : null}
        </main>
      </div>
    );
  }
};
