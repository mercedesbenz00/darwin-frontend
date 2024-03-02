import { createLocalVue, shallowMount } from '@vue/test-utils'

import AutoInstantiate from '@/components/DatasetSettings/ModelStage/AutoInstantiate.vue'

const localVue = createLocalVue()

let propsData: {
  value: boolean
}

const model = {
  checkBox: 'check-box-stub'
}

const itMatchesSnapshot = () => {
  it('matches snapshot', () => {
    const wrapper = shallowMount(AutoInstantiate, { localVue, propsData })
    expect(wrapper).toMatchSnapshot()
  })
}

const itEmitsChange = () => {
  it('emits change', async () => {
    const wrapper = shallowMount(AutoInstantiate, { localVue, propsData })
    await wrapper.find(model.checkBox).vm.$emit('change')
    expect(wrapper.emitted().change!.length).toEqual(1)
  })
}

describe('when enabled', () => {
  beforeEach(() => {
    propsData = {
      value: true
    }
  })

  itMatchesSnapshot()
  itEmitsChange()
})

describe('when disabled', () => {
  beforeEach(() => {
    propsData = { value: false }
  })

  itMatchesSnapshot()
  itEmitsChange()
})
