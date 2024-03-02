import { createLocalVue, shallowMount, Slots } from '@vue/test-utils'

import ClearbitLogo from '@/components/Common/ClearbitLogo.vue'

const localVue = createLocalVue()

let propsData: {
  companyUrl?: string
}
let slots: Slots

beforeEach(() => {
  slots = {
    default: '<div>Slots</div>'
  }
  propsData = {}
})

describe('without company url', () => {
  beforeEach(() => {
    propsData = {}
  })

  it('matches snapshot without company url', () => {
    const wrapper = shallowMount(ClearbitLogo, { localVue, propsData, slots })
    expect(wrapper).toMatchSnapshot()
  })
})

describe('with company url', () => {
  beforeEach(() => {
    propsData = {
      companyUrl: 'v7labs.com'
    }
  })

  it('matches snapshot', () => {
    const wrapper = shallowMount(ClearbitLogo, { localVue, propsData, slots })
    expect(wrapper).toMatchSnapshot()
  })

  it('emits load when image is loaded', async () => {
    const wrapper = shallowMount(ClearbitLogo, { localVue, propsData, slots })
    await wrapper.find('img').trigger('load')
    expect(wrapper.emitted().load).toEqual([['//logo.clearbit.com/v7labs.com']])
  })

  it('emits error when image loading fails', async () => {
    const wrapper = shallowMount(ClearbitLogo, { localVue, propsData, slots })
    await wrapper.find('img').trigger('error')
    expect(wrapper.emitted().error).toHaveLength(1)
  })
})
