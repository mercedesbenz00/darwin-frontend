import { Wrapper } from '@vue/test-utils'

export default class InputFieldModel {
  wrapper: Wrapper<Vue>
  constructor (wrapper: Wrapper<Vue>) {
    this.wrapper = wrapper
  }

  get isDisabled (): boolean {
    return this.wrapper.props('disabled') === true
  }

  set (value: number) {
    return this.wrapper.vm.$emit('input', value)
  }
}
