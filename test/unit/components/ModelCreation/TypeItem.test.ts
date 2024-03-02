import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'

import TypeItem from '@/components/ModelCreation/TypeItem.vue'
import { TYPES } from '@/components/ModelCreation/data'
import { ModelTypeInfo } from '@/components/ModelCreation/types'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>
let propsData: {
  type: ModelTypeInfo
}

const types: ModelTypeInfo[] = TYPES.map(t => ({
  ...t,
  available: true,
  mostAccurate: false
}))

beforeEach(() => {
  store = createTestStore()
  propsData = {
    type: types[0]
  }
})

types.forEach(t => {
  describe(`when ${t.name}`, () => {
    beforeEach(() => {
      propsData.type = t
    })

    it('matches snapshot', () => {
      const wrapper = shallowMount(TypeItem, { localVue, propsData, store })
      expect(wrapper).toMatchSnapshot()
    })

    it('sets type on store on click', async () => {
      const wrapper = shallowMount(TypeItem, { localVue, propsData, store })
      await wrapper.find('button').trigger('click')
      expect(store.state.neuralModel.newModelType).toEqual(t.id)
    })
  })
})

describe('when most accurate', () => {
  beforeEach(() => {
    propsData.type = { ...types[0], mostAccurate: true }
  })

  it('matches snapshot', () => {
    const wrapper = shallowMount(TypeItem, { localVue, propsData, store })
    expect(wrapper).toMatchSnapshot()
  })

  it('renders "most accurate" label', () => {
    const wrapper = shallowMount(TypeItem, { localVue, propsData, store })
    expect(wrapper.text()).toContain('Most accurate')
  })
})

describe('when unavailable', () => {
  beforeEach(() => {
    propsData.type = { ...types[3], available: false }
  })

  it('matches snapshot', () => {
    const wrapper = shallowMount(TypeItem, { localVue, propsData, store })
    expect(wrapper).toMatchSnapshot()
  })

  it('renders "Coming soon" label', () => {
    const wrapper = shallowMount(TypeItem, { localVue, propsData, store })
    expect(wrapper.text()).toContain('Coming soon')
  })

  it('renders disabled', async () => {
    const wrapper = shallowMount(TypeItem, { localVue, propsData, store })
    expect(store.state.neuralModel.newModelType).not.toEqual(propsData.type.id)
    await wrapper.find('button').trigger('click')
    expect(store.state.neuralModel.newModelType).not.toEqual(propsData.type.id)
  })
})
