import isFunction from 'lodash/lang/isFunction';
import { backHistory } from './utils';
import session from './session';
import m from 'mithril';

const stack = [];

export default function backbutton() {
  var b = stack.pop();
  if (isFunction(b)) {
    b('backbutton');
    m.redraw();
  } else if (!/^\/$/.test(m.route())) {
    // if playing a game as anon ask for confirmation because there is no way
    // back!
    if (/^\/game\/[a-zA-Z0-9]{12}/.test(m.route()) && !session.isConnected()) {
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
