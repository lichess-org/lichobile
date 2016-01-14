import * as utils from '../../../utils';
import helper from '../../helper';
import { header as headerWidget, backButton, empty } from '../../shared/common';
import layout from '../../layout';
import gameApi from '../../../lichess/game';
import i18n from '../../../i18n';
import gameStatus from '../../../lichess/status';
import { toggleGameBookmark } from '../../../xhr';
import session from '../../../session';
import m from 'mithril';
import ViewOnlyBoard from '../../shared/ViewOnlyBoard';

export default function view(ctrl) {
  const header = utils.partialf(headerWidget, null,
    backButton(ctrl.user() ? (ctrl.user().username + ' ' + ctrl.variant + ' stats') : '')
  );

  function renderBody() {
    return (
      <div>

      </div>
    );
  }

  return layout.free(header, renderBody, empty, empty);
}
