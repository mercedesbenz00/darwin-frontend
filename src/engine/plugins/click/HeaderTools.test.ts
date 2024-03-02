import { createLocalVue, shallowMount, Wrapper } from '@vue/test-utils'

import HeaderTools from '@/engine/plugins/click/HeaderTools.vue'
import { installCommonComponents } from '@/plugins/components'

const localVue = createLocalVue()
installCommonComponents(localVue)

class Model {
  wrapper: Wrapper<Vue>

  constructor (wrapper: Wrapper<Vue>) {
    this.wrapper = wrapper
  }

  clickRerun () {
    this.wrapper.find('secondary-button-stub.rerun').vm.$emit('click')
  }
}

it('Can call onRerun when not busy', async () => {
  const fakeOnRerun = jest.fn()
  const propsData = {
    x: 0,
    y: 0,
    onClear: () => {},
    onRerun: fakeOnRerun,
    busy: false
  }

  const wrapper = shallowMount(HeaderTools, { localVue, propsData })
  const model = new Model(wrapper)
  await model.clickRerun()
  expect(fakeOnRerun).toHaveBeenCalled()
})

it('Cannot call onRerun when busy', async () => {
  const fakeOnRerun = jest.fn()
  const propsData = {
    x: 0,
    y: 0,
    onClear: () => {},
    onRerun: fakeOnRerun,
    busy: true
  }

  const wrapper = shallowMount(HeaderTools, { localVue, propsData })
  const model = new Model(wrapper)
  await model.clickRerun()
  expect(fakeOnRerun).not.toHaveBeenCalled()
})
