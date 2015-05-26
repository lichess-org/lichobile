/** @jsx m */
import menu from './menu';
import gamesMenu from './gamesMenu';
import newGameForm from './newGameForm';
import challengeForm from './challengeForm';
import loginModal from './loginModal';
import signupModal from './signupModal';
import friendsPopup from './friendsPopup';
import helper from './helper';

function headerHeight() {
  var d = helper.viewportDim();
  return (d.vh - d.vw) / 2;
}

export default {

  board: function(header, content, footer, overlay, povColor) {
    const mainClass = [
      menu.isOpen ? 'out' : 'in',
      povColor || 'white'
    ].join(' ');
    return (
      <div className="view-container">
        <main id="page" className={mainClass}>
          <header className="main_header board" style={{height: headerHeight() + 'px' }}>
            {header()}
          </header>
          {content()}
          <footer className="main_footer board" style={{height: headerHeight() + 'px' }}>
            {footer()}
          </footer>
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
