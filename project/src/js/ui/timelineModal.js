import helper from './helper';
import i18n from '../i18n';
import backbutton from '../backbutton';
import timeline from '../lichess/timeline';
import { gameIcon } from '../utils';
import m from 'mithril';

const timelineModal = {};

timelineModal.isOpen = false;

timelineModal.open = function() {
  backbutton.stack.push(timelineModal.close);
  timeline.setLastReadTimestamp();
  timelineModal.isOpen = true;
};

timelineModal.close = function(fromBB) {
  if (fromBB !== 'backbutton' && timelineModal.isOpen) backbutton.stack.pop();
  timelineModal.isOpen = false;
};

const animateClose = helper.slidesOutRight(timelineModal.close, 'timelineModal');

timelineModal.view = function() {
  if (!timelineModal.isOpen) return null;

  return m('div.modal#timelineModal', { config: helper.slidesInLeft }, [
    m('header', [
      m('button.modal_close[data-icon=L]', {
        config: helper.ontouch(animateClose)
      }),
      m('h2', i18n('timeline'))
    ]),
    m('div.modal_content', {}, [
      m('ul.timelineEntries.native_scroller', timeline.get().map(e => {
        if (e.type === 'follow') {
          return renderFollow(e);
        } else if (e.type === 'game-end') {
          return renderGameEnd(e);
        }
        return null;
      }))
    ])
  ]);
};

function renderFollow(entry) {
  const fromNow = window.moment(entry.date).fromNow();
  const entryText = i18n('xStartedFollowingY', entry.data.u1, entry.data.u2);
  const key = 'follow' + entry.date;

  return (
    <li className="list_item bglight timelineEntry fa fa-arrow-circle-right" key={key}
      config={helper.ontouch(() => {
        animateClose().then(() =>
          m.route('/@/' + entry.data.u1)
        );
      })}
    >
      {m.trust(entryText.replace(/^(\w+)\s/, '<strong>$1&nbsp;</strong>'))}
      <small><em>&nbsp;{fromNow}</em></small>
    </li>
  );
}

function renderGameEnd(entry) {
  const icon = gameIcon(entry.data.perf);
  const result = entry.data.win ? 'Victory' : 'Defeat';
  const fromNow = window.moment(entry.date).fromNow();
  const key = 'game-end' + entry.date;

  return (
    <li className="list_item timelineEntry" key={key} data-icon={icon}
      config={helper.ontouch(() => {
        return animateClose().then(() =>
          m.route('/game/' + entry.data.playerId)
        );
      })}
    >
      <strong>{result}</strong> vs. {entry.data.opponent}
      <small><em>&nbsp;{fromNow}</em></small>
    </li>
  );
}

export default timelineModal;
