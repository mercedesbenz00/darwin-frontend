import { createLocalVue, shallowMount, Stubs } from '@vue/test-utils'
import Vuex from 'vuex'

import { ToggleButton } from 'test/unit/components/WorkView/TopBar/components/stubs'
import createTestStore from 'test/unit/createTestStore'

import MeasureToggle from '@/components/WorkView/TopBar/components/MeasureToggle.vue'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>
const stubs: Stubs = { ToggleButton }

beforeEach(() => {
  store = createTestStore()
})

it('matches snapshot depending on state of rendering measures', async () => {
  const wrapper = shallowMount(MeasureToggle, { localVue, store, stubs })
  expect(wrapper).toMatchSnapshot()
  store.commit('workview/TOGGLE_MEASURES')
  await wrapper.vm.$nextTick()
  expect(wrapper).toMatchSnapshot()
})

it('changes state of rendering measures in store on click', async () => {
  const wrapper = shallowMount(MeasureToggle, { localVue, store, stubs })
  expect(store.state.workview.renderMeasures).toBe(false)

  await wrapper.find('button').trigger('click')
  expect(store.state.workview.renderMeasures).toBe(true)

  await wrapper.find('button').trigger('click')
  expect(store.state.workview.renderMeasures).toBe(false)
})
