import { createLocalVue, shallowMount, Stubs } from '@vue/test-utils'
import Vuex from 'vuex'

import { createMockTheme } from 'test/unit/components/mocks'
import createTestStore from 'test/unit/createTestStore'
import { VueSlider } from 'test/unit/stubs'

import ClickerCoarseSlider from './ClickerCoarseSlider.vue'

const localVue = createLocalVue()
localVue.use(Vuex)

const mocks = { $theme: createMockTheme() }
const stubs: Stubs = { 'vue-slider': VueSlider }

let store: ReturnType<typeof createTestStore>

beforeEach(() => { store = createTestStore() })

it('matches the snapshot', () => {
  const wrapper = shallowMount(ClickerCoarseSlider, { localVue, mocks, store, stubs })
  expect(wrapper).toMatchSnapshot()
})

it('emits input and change when value changes', async () => {
  jest.spyOn(store, 'commit').mockReturnValue(undefined)
  const wrapper = shallowMount(ClickerCoarseSlider, { localVue, mocks, store, stubs })
  await wrapper.find('.clicker-coarse-selector__wrapper__slider').vm.$emit('input', 2)
  expect(store.commit).toBeCalledWith('workview/SET_CLICKER_EPSILON', 2)
})
