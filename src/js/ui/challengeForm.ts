import * as utils from '../utils';
import router from '../router';
import { challenge as challengeXhr } from '../xhr';
import settings from '../settings';
import session from '../session';
import formWidgets from './shared/form';
import popupWidget from './shared/popup';
import i18n from '../i18n';
import storage from '../storage';
import ViewOnlyBoard from './shared/ViewOnlyBoard';
import * as helper from './helper';
import * as m from 'mithril';
import * as stream from 'mithril/stream';

let actionName = '';
let userId: string;
let fen: string;

const isOpen = stream(false);

function open(uid?: string) {
  if (uid) {
    userId = uid;
    actionName = i18n('challengeToPlay');
  } else {
    userId = null;
    actionName = i18n('playWithAFriend');
  }
  router.backbutton.stack.push(close);
  isOpen(true);
  fen = null;
}


function close(fromBB?: string) {
  if (fromBB !== 'backbutton' && isOpen()) router.backbutton.stack.pop();
  isOpen(false);
};

function challenge() {
  return challengeXhr(userId, fen)
  .then(data => {

    helper.analyticsTrackEvent('Challenge', 'Sent');

    if (session.isConnected() && (
      data.challenge.timeControl.type === 'correspondence' ||
      data.challenge.timeControl.type === 'unlimited')) {

      if (!storage.get('donotshowpersistentchallengeexplanation')) {
        window.navigator.notification.alert(i18n('persistentChallengeCreated'), function() {
          storage.set('donotshowpersistentchallengeexplanation', true);
        });
      }
      router.set('/correspondence?tab=challenges');
    }
    if (!data.challenge.destUser || data.challenge.timeControl.type === 'clock') {
      router.set(`/challenge/${data.challenge.id}`);
    }
  })
  .catch(utils.handleXhrError);
}

function renderForm() {
  const formName = 'invite';
  const settingsObj = settings.gameSetup.challenge;
  const variants = settings.gameSetup.challenge.availableVariants;
  const timeModes = settings.gameSetup.challenge.availableTimeModes;
  const timeMode = settingsObj.timeMode();
  const hasClock = timeMode === '1';
  const hasDays = timeMode === '2';

  // if mode is rated only allow random color for three-check, atomic, antichess
  // horde variants
  let colors: string[][];
  if (settingsObj.mode() === '1' &&
    ['5', '6', '7', '8', '9'].indexOf(settingsObj.variant()) !== -1) {
    settingsObj.color('random');
    colors = [
      ['randomColor', 'random']
    ];
  } else {
    colors = [
      ['randomColor', 'random'],
      ['white', 'white'],
      ['black', 'black']
    ];
  }

  const modes = session.isConnected() ? [
    ['casual', '0'],
    ['rated', '1']
  ] : [
    ['casual', '0']
  ];

  const generalFieldset = [
    m('div.select_input', {
      key: formName + 'color'
    },
      formWidgets.renderSelect('side', formName + 'color', colors, settingsObj.color)
    ),
    m('div.select_input', {
      key: formName + 'variant'
    },
      formWidgets.renderSelect('variant', formName + 'variant', variants, settingsObj.variant)
    ),
    settingsObj.variant() === '3' ?
    m('div.setupPosition', {
      key: 'position'
    }, fen ? [
      m('div.setupMiniBoardWrapper', {
        oncreate: helper.ontap(() => {
          close();
          router.set(`/editor/${encodeURIComponent(fen)}`);
        })
      }, [
        m(ViewOnlyBoard, { fen })
      ])
      ] : m('div', m('button.withIcon', {
        oncreate: helper.ontap(() => {
          close();
          router.set('/editor');
        })
      }, [m('span.fa.fa-pencil'), i18n('boardEditor')]))
    ) : null,
    settingsObj.variant() !== '3' ?
    m('div.select_input', {
      key: formName + 'mode'
    },
      formWidgets.renderSelect('mode', formName + 'mode', modes, settingsObj.mode)
    ) : null
  ];

  const timeFieldset = [
    m('div.select_input', {
      key: formName + 'timeMode'
    },
      formWidgets.renderSelect('clock', formName + 'timeMode', timeModes, settingsObj.timeMode)
    )
  ];

  if (hasClock) {
    timeFieldset.push(
      m('div.select_input.inline', {
        key: formName + 'time'
      },
        formWidgets.renderSelect('time', formName + 'time',
          settings.gameSetup.availableTimes, settingsObj.time, false)
      ),
      m('div.select_input.inline', {
        key: formName + 'increment'
      },
        formWidgets.renderSelect('increment', formName + 'increment',
          settings.gameSetup.availableIncrements.map(utils.tupleOf), settingsObj.increment, false)
      )
    );
  }

  if (hasDays) {
    timeFieldset.push(
      m('div.select_input.large_label', {
        key: formName + 'days'
      },
        formWidgets.renderSelect('daysPerTurn', formName + 'days',
          settings.gameSetup.availableDays.map(utils.tupleOf), settingsObj.days, false)
      ));
  }

  return m('form#invite_form.game_form', {
    onsubmit(e: Event) {
      e.preventDefault();
      if (!settings.gameSetup.isTimeValid(settingsObj)) return;
      close();
      challenge();
    }
  }, [
    m('fieldset', generalFieldset),
    m('fieldset#clock', timeFieldset),
    m('button[data-icon=E][type=submit].newGameButton', actionName)
  ]);
}

export default {
  view() {
    return popupWidget(
      'invite_form_popup game_form_popup',
      null,
      renderForm,
      isOpen(),
      close
    );
  },

  open,
  openFromPosition(f: string) {
    open();
    fen = f;
    settings.gameSetup.challenge.variant('3');
    settings.gameSetup.challenge.mode('0');
  }
}
