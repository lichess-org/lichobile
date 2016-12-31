import { header as headerWidget, backButton as renderBackbutton } from '../shared/common';
import layout from '../layout';
import i18n from '../../i18n';

export default function view() {
  const ctrl = this;
  const user = ctrl.user();

  if (!user) return layout.empty();

  function header() {
    return headerWidget(renderBackbutton('Search'));
  }

  return layout.free(header, renderSearchForm);
}

function renderSearchForm() {
  return (
    <section className="profile">
    </section>
  );
}
