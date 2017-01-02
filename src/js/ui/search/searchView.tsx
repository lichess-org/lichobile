import { header as headerWidget, backButton as renderBackbutton } from '../shared/common';
import layout from '../layout';
import i18n from '../../i18n';
import formWidgets from '../shared/form';
import settings from '../../settings';
import {SearchState} from './interfaces';

export default function view(vnode: Mithril.Vnode<{}, SearchState>) {
  const ctrl = vnode.state;

  function header() {
    return headerWidget(renderBackbutton('Search'));
  }

  return layout.free(header, () => renderSearchForm(ctrl));
}

function renderSearchForm(ctrl: SearchState) {
  return (
    <form id="advancedSearchForm"
    onsubmit={function(e: Event) {
      e.preventDefault();
      return ctrl.search(e.target as HTMLFormElement);
    }}>
      <fieldset>
        <div className="select_input no_arrow_after">
          <div className="text_input_container">
            <label>Players: </label>
            <input type="text" id="players.a" />
            <input type="text" id="players.b" />
          </div>
        </div>
        <div className="select_input">
          {formWidgets.renderSelectWithGroup('Position', 'position', settings.tournament.availablePositions, settings.tournament.position, false, null)}
        </div>
        <div className="select_input inline">
          {formWidgets.renderSelect('Time', 'time', settings.tournament.availableTimes, settings.tournament.time, false, null)}
        </div>
      </fieldset>
      <button key="create" className="newGameButton" type="submit">
        <span className="fa fa-search" />
        {i18n('search')}
      </button>
    </form>
  );
}
