import h from 'mithril/hyperscript'

import i18n from '../../i18n'
import redraw from '../../utils/redraw'
import { Prop } from '../../settings'
import * as helper from '../helper'

type SelectOption = ReadonlyArray<string>
interface MultiOption<T> {
  label: string
  value: T
  labelArg?: string
}

export default {
  booleanChoice: [
    { label: 'no', value: false },
    { label: 'yes', value: true }
  ] as readonly MultiOption<boolean>[],

  renderRadio(
    label: string,
    name: string,
    value: string,
    checked: boolean,
    onchange: (e: Event) => void,
    disabled?: boolean
  ) {
    const id = name + '_' + value
    return [
      h('input.radio[type=radio]', {
        name,
        id,
        className: value,
        value,
        checked,
        onchange,
        disabled
      }),
      h('label', {
        'for': id
      }, i18n(label))
    ]
  },

  renderSelect(
    label: string,
    name: string,
    options: ReadonlyArray<SelectOption>,
    settingsProp: Prop<string>,
    isDisabled?: boolean,
    onChangeCallback?: (v: string) => void
  ) {
    const prop = settingsProp()
    return [
      h('label', {
        'for': 'select_' + name
      }, i18n(label)),
      h('select', {
        id: 'select_' + name,
        disabled: isDisabled,
        onchange(e: Event) {
          const val = (e.target as HTMLSelectElement).value
          settingsProp(val)
          if (onChangeCallback) onChangeCallback(val)
          setTimeout(redraw, 10)
        }
      }, options.map(e => renderOption(e[0], e[1], prop, e[2], e[3])))
    ]
  },

  renderCheckbox(
    label: Mithril.Children,
    name: string,
    settingsProp: Prop<boolean>,
    callback?: (v: boolean) => void,
    disabled?: boolean
  ) {
    const isOn = settingsProp()
    return h('div.check_container', {
      className: disabled ? 'disabled' : ''
    }, [
      h('label', {
        'for': name
      }, label),
      h('input[type=checkbox]', {
        id: name,
        name: name,
        disabled,
        checked: isOn,
        onchange: () => {
          const newVal = !isOn
          settingsProp(newVal)
          if (callback) callback(newVal)
          redraw()
        }
      })
    ])
  },

  renderMultipleChoiceButton<T>(
    label: string,
    options: ReadonlyArray<MultiOption<T>>,
    prop: Prop<T>,
    wrap = false,
    callback?: (v: T) => void,
  ) {
    const selected = prop()
    return h('div.form-multipleChoiceContainer', [
      h('label', label),
      h('div.form-multipleChoice', {
        className: wrap ? 'wrap' : ''
      }, options.map(o => {
        const l = o.labelArg !== undefined ? i18n(o.label, o.labelArg) : i18n(o.label)
        return h('div', {
          className: o.value === selected ? 'selected' : '',
          oncreate: helper.ontap(() => {
            prop(o.value)
            if (callback) callback(o.value)
          })
        }, l)
      }))
    ])
  },

  renderSlider(
    label: string,
    name: string,
    min: number,
    max: number,
    step: number,
    prop: Prop<number>,
    onChange?: (v: number) => void,
    disabled?: boolean,
  ) {
    const value = prop()
    return h('div.forms-rangeSlider', {
      className: disabled ? 'disabled' : ''
    }, [
      h('label', { 'for': name }, label),
      h('input[type=range]', {
        id: name,
        value,
        disabled,
        min,
        max,
        step,
        oninput(e: Event) {
          const val = (e.target as HTMLInputElement).value
          const nval = ~~val
          prop(nval)
          if (onChange) onChange(nval)
          setTimeout(redraw, 10)
        }
      }),
      h('div.forms-sliderValue', value + ' / ' + max)
    ])
  }
}

function renderOption(label: string, value: string, prop: string, labelArg?: string, labelArg2?: string) {
  const l = labelArg && labelArg2 ? i18n(label, labelArg, labelArg2) :
    labelArg ? i18n(label, labelArg) : i18n(label)
  return h('option', {
    key: value,
    value,
    selected: prop === value
  }, l)
}
