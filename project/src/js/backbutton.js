import isFunction from 'lodash/lang/isFunction';
import * as utils from './utils';

const stack = [];

export default function backbutton() {
  var b = stack.pop();
  if (isFunction(b)) {
    b('backbutton');
    m.redraw();
  } else if (!/^\/$/.test(m.route())) {
    utils.backHistory();
  } else {
    window.navigator.app.exitApp();
  }
}

backbutton.stack = stack;
