import * as utils from '../../utils';
import { header as headerWidget, backButton, empty } from '../shared/common';
import formWidgets from '../shared/form';
import layout from '../layout';
import i18n, { loadFromSettings, getAvailableLanguages } from '../../i18n';
import settings from '../../settings';
import { setServerLang } from '../../xhr';
import m from 'mithril';

export default {
  controller: function() {
    const langs = m.prop([]);

    getAvailableLanguages().then(langs);

    return {
      langs
    };
  },

  view: function(ctrl) {
    const header = utils.partialf(headerWidget, null,
      backButton(i18n('language'))
    );

    function renderLang(l) {
      return (
        <li className="list_item">
          {formWidgets.renderRadio(l[1], 'lang', l[0],
            settings.general.lang() === l[0],
            e => {
              settings.general.lang(e.target.value);
              setServerLang(e.target.value);
              loadFromSettings();
            }
          )}
        </li>
      );
    }

    function renderBody() {
      return (
        <ul className="native_scroller page settings_list radio_list">
          {ctrl.langs().map(l => renderLang(l))}
        </ul>
      );
    }

    return layout.free(header, renderBody, empty, empty);
  }
};
