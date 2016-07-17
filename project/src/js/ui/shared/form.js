import i18n from '../../i18n';
import m from 'mithril';

function renderOption(label, value, storedValue, labelArg, labelArg2) {
  return m('option', {
    value: value,
    selected: storedValue === value
  }, i18n(label, labelArg, labelArg2));
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
        m.redraw();
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
      }, options.map(function(e) {
        return renderOption(e[0], e[1], storedValue, e[2], e[3]);
      }))
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
        }
      })
    ]);
  }

};
