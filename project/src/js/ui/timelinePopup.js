import helper from './helper';
import popupWidget from './shared/popup';
import i18n from '../i18n';
import backbutton from '../backbutton';
import m from 'mithril';

const timelinePopup = {};

timelinePopup.isOpen = false;

timelinePopup.open = function() {
  helper.analyticsTrackView('Online Friends');
  backbutton.stack.push(timelinePopup.close);
  timelinePopup.isOpen = true;
};

timelinePopup.close = function(fromBB) {
  if (fromBB !== 'backbutton' && timelinePopup.isOpen) backbutton.stack.pop();
  timelinePopup.isOpen = false;
};

timelinePopup.view = function() {

  function header() {
    return <div><span data-icon="f"/>{i18n('timeline')}</div>;
  }

  function content() {
  }

  return popupWidget(
    'timeline',
    header,
    content,
    timelinePopup.isOpen,
    timelinePopup.close
  );
};


export default timelinePopup;
