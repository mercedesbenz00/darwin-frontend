import { createLocalVue, shallowMount } from '@vue/test-utils'
import { cloneDeep } from 'lodash'
import Vuex from 'vuex'

import modelTiers from 'test/unit/fixtures/modelTiers.json'

import TierSelection from '@/components/Models/TierSelection.vue'
import neuralModel from '@/store/modules/neuralModel'

const localVue = createLocalVue()
localVue.use(Vuex)

const newStore = () => {
  const store = new Vuex.Store({
    modules: {
      neuralModel: { ...neuralModel, state: cloneDeep(neuralModel.state) }
    }
  })
  jest.spyOn(store, 'dispatch').mockResolvedValue({})

  store.commit('neuralModel/SET_TIERS', modelTiers)

  return store
}

const tiers = ['evaluation', 'standard', 'production']
tiers.forEach(tier => {
  it(`matches snapshot for '${tier}' tier`, () => {
    const propsData = { tier }
    const store = newStore()
    const wrapper = shallowMount(TierSelection, { localVue, propsData, store })
    expect(wrapper).toMatchSnapshot()
  })
})

it('emits event on tier selection', () => {
  const propsData = { tier: 'evaluation' }
  const store = newStore()
  const wrapper = shallowMount(TierSelection, { localVue, propsData, store })
  const slider = wrapper.find('double-slider-stub').vm

  slider.$emit('change', 'standard')
  expect(wrapper.emitted().select).toEqual([['standard']])

  slider.$emit('change', 'production')
  expect(wrapper.emitted().select).toEqual([['standard'], ['production']])

  slider.$emit('change', 'evaluation')
  expect(wrapper.emitted().select).toEqual([['standard'], ['production'], ['evaluation']])
})
