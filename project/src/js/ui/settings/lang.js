/** @jsx m */
import utils from '../../utils';
import widgets from '../widget/common';
import formWidgets from '../widget/form';
import layout from '../layout';
import i18n from '../../i18n';
import settings from '../../settings';

module.exports = {
  controller: function() {
    const langs = m.prop([]);

    i18n.getAvailableLanguages().then(langs);

    return {
      langs
    };
  },

  view: function(ctrl) {
    var header = utils.partialf(widgets.header, null,
      widgets.backButton(i18n('language'))
    );

    function renderLang(l) {
      return (
        <li className="list_item">
          {formWidgets.renderRadio(l[1], 'lang', l[0],
            settings.general.lang() === l[0],
            e => {
              settings.general.lang(e.target.value);
              i18n.loadFromSettings();
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

    return layout.free(header, renderBody, widgets.empty, widgets.empty);
  }
};
