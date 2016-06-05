import * as utils from '../../utils';
import helper from '../helper';
import settings from '../../settings';
import m from 'mithril';
import socket from '../../socket';

export default function controller() {
  const isRunning = m.prop(false);
  const clcokSettingsCtrl = clockSettings.controller();

  function startStop () {
    isRunning(!isRunning());
  }

  return {
    isRunning,
    startStop
  };
}
