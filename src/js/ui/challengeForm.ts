import * as utils from '../utils';
import router from '../router';
import redraw from '../utils/redraw';
import { challenge as challengeXhr } from '../xhr';
import { validateFen } from '../utils/fen';
import settings from '../settings';
import session from '../session';
import formWidgets from './shared/form';
import popupWidget from './shared/popup';
import i18n from '../i18n';
import storage from '../storage';
import ViewOnlyBoard from './shared/ViewOnlyBoard';
import * as helper from './helper';
import * as h from 'mithril/hyperscript';
import * as stream from 'mithril/stream';

let actionName = '';
let userId: string;
let setupFen: string;
let setupFenError: string;

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
  setupFen = null;
  setupFenError = null;
}


function close(fromBB?: string) {
  if (fromBB !== 'backbutton' && isOpen()) router.backbutton.stack.pop();
  isOpen(false);
};

function doChallenge() {
  return challengeXhr(userId, setupFen)
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
    h('div.select_input', {
      key: formName + 'color'
    },
      formWidgets.renderSelect('side', formName + 'color', colors, settingsObj.color)
    ),
    h('div.select_input', {
      key: formName + 'variant'
    },
      formWidgets.renderSelect('variant', formName + 'variant', variants, settingsObj.variant)
    ),
    settingsObj.variant() === '3' ?
    h('div.setupPosition', {
      key: 'position'
    },
    userId ?
    h('input[type=text][name=fen]', {
      placeholder: i18n('pasteTheFenStringHere'),
      oninput: (e: Event) => {
        const rawfen = (e.target as HTMLInputElement).value
        if (validateFen(rawfen).valid) {
          setupFen = rawfen
          setupFenError = null
        }
        else setupFenError = 'Invalid FEN'
        redraw()
      }
    }) : h('div', h('button.withIcon', {
      oncreate: helper.ontap(() => {
        close();
        router.set('/editor');
      })
    }, [h('span.fa.fa-pencil'), i18n('boardEditor')])),
    setupFenError ?
    h('div.setupFenError', setupFenError) : null,
    setupFen ? [
      h('div', {
        style: {
          width: '100px',
          height: '100px'
        },
        oncreate: helper.ontap(() => {
          close();
          router.set(`/editor/${encodeURIComponent(setupFen)}`);
        })
      }, [
        h(ViewOnlyBoard, { fen: setupFen, bounds: { width: 100, height: 100 }})
      ])
      ] : null
    ) : null,
    settingsObj.variant() !== '3' ?
    h('div.select_input', {
      key: formName + 'mode'
    },
      formWidgets.renderSelect('mode', formName + 'mode', modes, settingsObj.mode)
    ) : null
  ];

  const timeFieldset = [
    h('div.select_input', {
      key: formName + 'timeMode'
    },
      formWidgets.renderSelect('clock', formName + 'timeMode', timeModes, settingsObj.timeMode)
    )
  ];

  if (hasClock) {
    timeFieldset.push(
      h('div.select_input.inline', {
        key: formName + 'time'
      },
        formWidgets.renderSelect('time', formName + 'time',
          settings.gameSetup.availableTimes, settingsObj.time, false)
      ),
      h('div.select_input.inline', {
        key: formName + 'increment'
      },
        formWidgets.renderSelect('increment', formName + 'increment',
          settings.gameSetup.availableIncrements.map(utils.tupleOf), settingsObj.increment, false)
      )
    );
  }

  if (hasDays) {
    timeFieldset.push(
      h('div.select_input.large_label', {
        key: formName + 'days'
      },
        formWidgets.renderSelect('daysPerTurn', formName + 'days',
          settings.gameSetup.availableDays.map(utils.tupleOf), settingsObj.days, false)
      ));
  }

  return h('form#invite_form.game_form', {
    onsubmit(e: Event) {
      e.preventDefault();
      if (!settings.gameSetup.isTimeValid(settingsObj)) return;
      close();
      doChallenge();
    }
  }, [
    h('fieldset', generalFieldset),
    h('fieldset#clock', timeFieldset),
    h('button[data-icon=E][type=submit].newGameButton', actionName)
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
    setupFen = f;
    settings.gameSetup.challenge.variant('3');
    settings.gameSetup.challenge.mode('0');
  }
}
