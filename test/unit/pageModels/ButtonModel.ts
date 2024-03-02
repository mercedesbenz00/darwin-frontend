import { Wrapper } from '@vue/test-utils'

export default class ButtonModel {
  wrapper: Wrapper<Vue>

  constructor (wrapper: Wrapper<Vue>) {
    this.wrapper = wrapper
  }

  get isDisabled (): boolean {
    return this.wrapper.attributes('disabled') === 'true'
  }

  click () {
    return this.wrapper.vm.$emit('click')
  }
}
