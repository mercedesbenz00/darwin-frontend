import { Wrapper } from '@vue/test-utils'

export default class CheckBoxModel {
  wrapper: Wrapper<Vue>

  constructor (wrapper: Wrapper<Vue>) {
    this.wrapper = wrapper
  }

  get isChecked (): boolean {
    return this.wrapper.props('value') === true
  }

  get isDisabled (): boolean {
    return this.wrapper.props('disabled') === true
  }

  check () {
    return this.wrapper.vm.$emit('input', true)
  }

  uncheck () {
    return this.wrapper.vm.$emit('input', false)
  }
}
