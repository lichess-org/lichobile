function renderOption(label, value, storedValue) {
  return m('option', {
    value: value,
    selected: storedValue === value
  }, label);
}

module.exports = {

  renderRadio: function(label, name, value, settingsProp) {
    var isOn = settingsProp() === value;
    var id = name + value;
    return [
      m('input.radio[type=radio]', {
        name: name,
        id: id,
        'class': value,
        value: value,
        checked: isOn,
        onchange: function(e) {
          settingsProp(e.target.value);
        }
      }),
      m('label', {
        'for': id
      }, label)
    ];
  },

  renderSelect: function(label, name, options, settingsProp, isDisabled) {
    var storedValue = settingsProp();
    return [
      m('label', {
        'for': name
      }, label),
      m('select', {
        name: name,
        disabled: isDisabled,
        onchange: function(e) {
          settingsProp(e.target.value);
        }
      }, options.map(function(e) {
        return renderOption(e[0], e[1], storedValue);
      }))
    ];
  },

  renderCheckbox: function(label, name, settingsProp) {
    var isOn = settingsProp();
    return m('div.check_container', [
      m('label', {
        'for': name
      }, label),
      m('input[type=checkbox]', {
        name: name,
        checked: isOn,
        onchange: function() {
          settingsProp(!isOn);
        }
      })
    ]);
  }

};
