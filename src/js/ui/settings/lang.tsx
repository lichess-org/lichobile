import { dropShadowHeader, backButton } from '../shared/common';
import redraw from '../../utils/redraw';
import * as helper from '../helper';
import formWidgets from '../shared/form';
import layout from '../layout';
import i18n, { loadFromSettings, getAvailableLanguages } from '../../i18n';
import settings from '../../settings';
import { setServerLang } from '../../xhr';
import * as stream from 'mithril/stream';

type Lang = [string, string]

interface State {
  langs: Mithril.Stream<Array<Lang>>
}

export const LangPrefScreen: Mithril.Component<{}, State> = {
  oncreate: helper.viewSlideIn,

  oninit() {
    this.langs = stream([]);

    getAvailableLanguages().then(data => {
      this.langs(data);
      redraw();
    });
  },

  view() {
    const ctrl = this
    const header = () => dropShadowHeader(null, backButton(i18n('language')))

    function renderLang(l: Lang) {
      return (
        <li className="list_item">
          {formWidgets.renderRadio(l[1], 'lang', l[0],
            settings.general.lang() === l[0],
            e => {
              settings.general.lang((e.target as HTMLInputElement).value);
              setServerLang((e.target as HTMLInputElement).value);
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

    return layout.free(header, renderBody);
  }
}

export default LangPrefScreen
