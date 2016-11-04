import i18n from '../../i18n';
import redraw from '../../utils/redraw';
import * as m from 'mithril';

function renderOption(label, value, storedValue, labelArg, labelArg2) {
  return m('option', {
    key: value,
    value: value,
    selected: storedValue === value
  }, i18n(label, labelArg, labelArg2));
}


function renderOptionGroup(label, value, storedValue, labelArg, labelArg2) {
  if (typeof value === 'string') {
    return renderOption(label, value, storedValue, labelArg, labelArg2);
  }
  else {
    return m('optgroup', {
      key: label,
      label
    }, value.map(e => renderOptionGroup(e[0], e[1], storedValue, e[2], e[3])));
  }
}

export default {

  renderRadio: function(label, name, value, checked, onchange) {
    var id = name + '_' + value;
    return [
      m('input.radio[type=radio]', {
        name,
        id,
        className: value,
        value,
        checked,
        onchange
      }),
      m('label', {
        'for': id
      }, i18n(label))
    ];
  },

  renderSelect: function(label, name, options, settingsProp, isDisabled, onChangeCallback) {
    var storedValue = settingsProp();
    const onChange = function(e) {
      settingsProp(e.target.value);
      if (onChangeCallback) onChangeCallback(e.target.value);
      setTimeout(function() {
        redraw();
      }, 10);
    };
    return [
      m('label', {
        'for': 'select_' + name
      }, i18n(label)),
      m('select', {
        id: 'select_' + name,
        disabled: isDisabled,
        oncreate: function(vnode) {
          vnode.dom.addEventListener('change', onChange, false);
        },
        onremove: function(vnode) {
          vnode.dom.removeEventListener('change', onChange, false);
        }
      }, options.map(e => renderOption(e[0], e[1], storedValue, e[2], e[3])))
    ];
  },

  renderCheckbox: function(label, name, settingsProp, callback, disabled) {
    var isOn = settingsProp();
    return m('div.check_container', {
      className: disabled ? 'disabled' : ''
    }, [
      m('label', {
        'for': name
      }, label),
      m('input[type=checkbox]', {
        name: name,
        disabled,
        checked: isOn,
        onchange: function() {
          const newVal = !isOn;
          settingsProp(newVal);
          if (callback) callback(newVal);
          redraw();
        }
      })
    ]);
  },

  renderSelectWithGroups: function(label, name, options, settingsProp, isDisabled, onChangeCallback) {
    var storedValue = settingsProp();
    const onChange = function(e) {
      settingsProp(e.target.value);
      if (onChangeCallback) onChangeCallback(e.target.value);
      setTimeout(function() {
        redraw();
      }, 10);
    };
    return [
      m('label', {
        'for': 'select_' + name
      }, i18n(label)),
      m('select', {
        id: 'select_' + name,
        disabled: isDisabled,
        oncreate: function(vnode) {
          vnode.dom.addEventListener('change', onChange, false);
        },
        onremove: function(vnode) {
          vnode.dom.removeEventListener('change', onChange, false);
        }
      }, options.map(e => renderOptionGroup(e[0], e[1], storedValue, e[2], e[3])))
    ];
  },
};
