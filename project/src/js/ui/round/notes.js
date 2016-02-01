import helper from '../helper';
import i18n from '../../i18n';
import backbutton from '../../backbutton';
import { debounce } from 'lodash/function';
import { syncNote } from './roundXhr';
import m from 'mithril';

export default {
  controller(root) {

    let notesHeight;

    this.root = root;
    this.showing = false;
    this.inputValue = '';

    this.open = function() {
      backbutton.stack.push(helper.slidesOut(this.close, 'notes'));
      this.showing = true;
    }.bind(this);

    this.close = function(fromBB) {
      window.cordova.plugins.Keyboard.close();
      if(fromBB !== 'backbutton' && this.showing) backbutton.stack.pop();
      this.showing = false;
    }.bind(this);

    function onKeyboardShow(e) {
      if (window.cordova.platformId === 'ios') {
        let ta = document.getElementById('notesTextarea');
        if (!ta) return;
        notesHeight = ta.offsetHeight;
        ta.style.height = (notesHeight - e.keyboardHeight) + 'px';
      }
    }

    function onKeyboardHide() {
      let ta = document.getElementById('notesTextarea');
      if (window.cordova.platformId === 'ios') {
        if (ta) ta.style.height = notesHeight + 'px';
      }
      if (ta) ta.blur();
    }

    this.syncNotes = debounce(e => {
      syncNote(this.root.data.game.id, e.target.value);
    }, 1000);

    window.addEventListener('native.keyboardhide', onKeyboardHide);
    window.addEventListener('native.keyboardshow', onKeyboardShow);

    this.onunload = function() {
      document.removeEventListener('native.keyboardhide', onKeyboardHide);
      document.removeEventListener('native.keyboardshow', onKeyboardShow);
    };
  },

  view: function(ctrl) {

    if (!ctrl.showing) return null;

    return m('div#notes.modal', { config: helper.slidesIn }, [
      m('header', [
        m('button.modal_close[data-icon=L]', {
          config: helper.ontouch(helper.slidesOut(ctrl.close, 'notes'))
        }),
        m('h2', i18n('notes'))
      ]),
      m('div.modal_content', [
        m('textarea#notesTextarea.native_scroller', {
          placeholder: i18n('typePrivateNotesHere'),
          oninput: ctrl.syncNotes
        }, ctrl.root.data.note)
      ])
    ]);
  }
};
