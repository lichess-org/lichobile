import menu from './menu';
import menuView from './menu/menuView';
import gamesMenu from './gamesMenu';
import newGameForm from './newGameForm';
import challengeForm from './challengeForm';
import loginModal from './loginModal';
import signupModal from './signupModal';
import friendsPopup from './friendsPopup';
import lobby from './lobby';
import helper from './helper';
import settings from '../settings';

var background;

export default {

  onBackgroundChange: function(bg) {
    background = bg;
  },

  board: function(header, content, overlay, color = '') {
    background = background || settings.general.theme.background();
    return (
      <div className={'view-container ' + background}>
        <main id="page" className={color}>
          <header className="main_header board">
            {header()}
          </header>
          <div className="content_round">{content()}</div>
          { menu.isOpen ? <div className="menu-close-overlay" config={helper.ontouch(menu.close)} /> : null }
        </main>
        {menuView()}
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
    background = background || settings.general.theme.background();
    return (
      <div className={'view-container ' + background}>
        <main id="page">
          <header className="main_header">
            {header()}
          </header>
          <div className={'content' + (footer ? ' withFooter' : '')}>
            {content()}
          </div>
          { footer ? <footer className="main_footer">{footer()}</footer> : null }
          { menu.isOpen ? <div className="menu-close-overlay" config={helper.ontouch(menu.close)} /> : null }
        </main>
        {menuView()}
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
  }
};
