import router from './router';
import redraw from './utils/redraw';
import { isFunction } from 'lodash/lang';
import { backHistory } from './utils';
import session from './session';

const stack = [];

export default function backbutton() {
  const b = stack.pop();
  if (isFunction(b)) {
    b('backbutton');
    redraw();
  } else if (!/^\/$/.test(router.get())) {
    // if playing a game as anon ask for confirmation because there is no way
    // back!
    if (/^\/game\/[a-zA-Z0-9]{12}/.test(router.get()) && !session.isConnected()) {
      navigator.notification.confirm(
        'Do you really want to leave the game? You can\'t go back to it after.',
        i => { if (i === 1) backHistory(); }
      );
    } else {
      backHistory();
    }
  } else {
    window.navigator.app.exitApp();
  }
}

backbutton.stack = stack;
