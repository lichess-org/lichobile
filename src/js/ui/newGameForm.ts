import * as utils from '../utils';
import router from '../router';
import * as xhr from '../xhr';
import settings, { GameSettings } from '../settings';
import spinner from '../spinner';
import session from '../session';
import * as helper from './helper';
import formWidgets from './shared/form';
import popupWidget from './shared/popup';
import i18n from '../i18n';
import lobby from './lobby';
import * as m from 'mithril';
import { Pool } from '../lichess/interfaces';

let isOpen = false

export default {
  open,

  close,

  openRealTime() {
    settings.gameSetup.human.timeMode('1');
    open();
  },

  openCorrespondence() {
    settings.gameSetup.human.timeMode('2');
    open();
  },

  view() {
    return popupWidget(
      'new_game_form_popup game_form_popup',
      null,
      renderContent,
      isOpen,
      close
    );
  }
};

function open() {
  if (xhr.cachedPools.length === 0) xhr.lobby(false)
  router.backbutton.stack.push(close);
  isOpen = true;
}

function close(fromBB?: string) {
  if (fromBB !== 'backbutton' && isOpen) router.backbutton.stack.pop();
  isOpen = false;
}

function goSeek() {
  const conf = settings.gameSetup.human
  // anon. can't enter pool: we'll just create a similar hook
  if (conf.preset() === 'quick' && !session.isConnected()) {
    const pool = xhr.cachedPools.find(p => p.id  === conf.pool())
    conf.time(String(pool.lim))
    conf.increment(String(pool.inc))
    conf.variant('1')
    conf.mode('0')
  }

  if (conf.preset() === 'quick' || conf.timeMode() === '1') {
    close();
    lobby.startSeeking();
  }
  else {
    xhr.seekGame()
    .catch(utils.handleXhrError);
    router.set('/correspondence');
  }
}

function renderContent() {

  const conf = settings.gameSetup.human;
  const preset = conf.preset();

  return m('div', [
    m('div.newGame-preset_switch', [
      m('div.nice-radio', formWidgets.renderRadio(
        'Quick game',
        'preset',
        'quick',
        preset === 'quick',
        e => utils.autoredraw(() => conf.preset((e.target as any).value))
      )),
      m('div.nice-radio', formWidgets.renderRadio(
        'Custom',
        'preset',
        'custom',
        preset === 'custom',
        e => utils.autoredraw(() => conf.preset((e.target as any).value))
      ))
    ]),
    preset === 'quick' ?
    renderQuickSetup() :
    renderCustomSetup(
      'human',
      conf,
      conf.availableVariants,
      conf.availableTimeModes.filter((e) => {
        // correspondence and unlimited time modes are only available when
        // connected
        return e[1] === '1' || session.isConnected();
      })
    ),
  ])
}

function renderQuickSetup() {
  const selectedPool = settings.gameSetup.human.pool()
  return m('div.newGame-pools', { key: 'quickSetup' }, xhr.cachedPools.length ?
    xhr.cachedPools.map(p => renderPool(p, selectedPool)) : spinner.getVdom()
  )
}

function renderPool(p: Pool, selectedPool: string) {
  return m('div.newGame-pool', {
    key: 'pools',
    oncreate: helper.ontap(() => {
      settings.gameSetup.human.pool(p.id)
      close();
      goSeek();
    })
  }, [
    m('div.newGame-clock', p.id),
    m('div.newGame-perf', p.perf)
  ])
}

function renderCustomSetup(formName: string, settingsObj: GameSettings, variants: string[][], timeModes: string[][]) {
  const timeMode = settingsObj.timeMode();
  const hasClock = timeMode === '1';
  const hasDays = timeMode === '2' && session.isConnected();

  // be sure to set real time clock if disconnected
  if (!session.isConnected()) {
    settings.gameSetup.human.timeMode('1');
  }
  if (timeMode === '0') {
    settings.gameSetup.human.mode('0');
  }

  // if mode is rated only allow random color
  let colors: string[][];
  if (settingsObj.mode() === '1') {
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

  const modes = (session.isConnected() && timeMode !== '0') ? [
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
    )
  ];

  generalFieldset.push(m('div.select_input', {
    key: formName + 'mode'
  },
    formWidgets.renderSelect('mode', formName + 'mode', modes, settingsObj.mode)
  ));

  if (session.isConnected() && settingsObj.mode() === '1') {
    generalFieldset.push(
      m('div.rating_range', {
        key: 'rating_range'
      }, [
        m('div.title', i18n('ratingRange')),
        m('div.select_input.inline',
          formWidgets.renderSelect('Min', formName + 'rating_min',
            settings.gameSetup.human.availableRatingRanges.min, settingsObj.ratingMin, false)
        ),
        m('div.select_input.inline',
          formWidgets.renderSelect('Max', formName + 'rating_max',
            settings.gameSetup.human.availableRatingRanges.max, settingsObj.ratingMax, false)
        )
      ])
    );
  }

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
      }, formWidgets.renderSelect('daysPerTurn', formName + 'days',
          settings.gameSetup.availableDays.map(utils.tupleOf), settingsObj.days, false)
      ));
  }

  return m('form.game_form', {
    key: 'customSetup',
    onsubmit(e: Event) {
      e.preventDefault();
      if (!settings.gameSetup.isTimeValid(settingsObj)) return;
      close();
      goSeek();
    }
  }, [
    m('fieldset', generalFieldset),
    m('fieldset', timeFieldset),
    m('button[data-icon=E][type=submit].newGameButton', i18n('createAGame'))
  ])
}
