import { createLocalVue, shallowMount, Stubs } from '@vue/test-utils'
import Vuex from 'vuex'

import { ToggleButton } from 'test/unit/components/WorkView/TopBar/components/stubs'
import createTestStore from 'test/unit/createTestStore'

import SubAnnotationToggle from '@/components/WorkView/TopBar/components/SubAnnotationToggle.vue'
import { SHOULD_RENDER_SUB_ANNOTATIONS } from '@/utils/localStorageKeys'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>
const stubs: Stubs = { ToggleButton }

beforeEach(() => {
  localStorage.removeItem(SHOULD_RENDER_SUB_ANNOTATIONS)
  store = createTestStore()
})

it('matches snapshot depending on state of rendering subannotations', async () => {
  const wrapper = shallowMount(SubAnnotationToggle, { localVue, store, stubs })
  expect(wrapper).toMatchSnapshot()
  store.commit('workview/TOGGLE_SUBANNOTATIONS')
  await wrapper.vm.$nextTick()
  expect(wrapper).toMatchSnapshot()
})

it('changes state of rendering subannotations in store on click', async () => {
  const wrapper = shallowMount(SubAnnotationToggle, { localVue, store, stubs })
  expect(store.state.workview.renderSubAnnotations).toBe(true)

  await wrapper.find('button').trigger('click')
  expect(store.state.workview.renderSubAnnotations).toBe(false)

  await wrapper.find('button').trigger('click')
  expect(store.state.workview.renderSubAnnotations).toBe(true)
})
