import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'

import FeatureGuard from '@/components/Common/FeatureGuard.vue'
import features, { getInitialState as featuresState } from '@/store/modules/features'

const localVue = createLocalVue()
localVue.use(Vuex)

const newStore = () => {
  const store = new Vuex.Store({
    modules: {
      features: { ...features, state: featuresState() }
    }
  })
  jest.spyOn(store, 'dispatch').mockResolvedValue({})
  return store
}

let store: ReturnType<typeof newStore>
let propsData: { feature: string }
beforeEach(() => {
  store = newStore()
  propsData = { feature: 'TEST_FEATURE' }
})

it('matches snapshot when feature is enabled', () => {
  const slots = { default: '<div class="default-slot">Default</div>' }
  store.commit('features/SET_FEATURES', [{ name: 'TEST_FEATURE', enabled: true }])
  const wrapper = shallowMount(FeatureGuard, { localVue, propsData, slots, store })

  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when features not loaded and else slot given', () => {
  const slots = {
    default: '<div class="default-slot">Default</div>',
    else: '<div class="else-slot">Else</div>'
  }
  const wrapper = shallowMount(FeatureGuard, { localVue, propsData, slots, store })

  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when feature is disabled and "else" slot not given', () => {
  store.commit('features/SET_FEATURES', [{ name: 'TEST_FEATURE', enabled: false }])
  const wrapper = shallowMount(FeatureGuard, { localVue, propsData, store })

  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when feature is disabled and "else" slot given', () => {
  store.commit('features/SET_FEATURES', [{ name: 'TEST_FEATURE', enabled: false }])
  const slots = { else: '<div class="else-slot">Else</div>' }
  const wrapper = shallowMount(FeatureGuard, { localVue, propsData, slots, store })

  expect(wrapper).toMatchSnapshot()
})
