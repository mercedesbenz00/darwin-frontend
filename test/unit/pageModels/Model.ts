import { Wrapper } from 'test/integration/testHelpers'

export default class Model {
  wrapper: Wrapper<Vue>

  constructor (wrapper: Wrapper<Vue>) {
    this.wrapper = wrapper
  }
}
