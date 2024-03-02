import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'

import { BreadCrumb } from '@/mixins/BreadCrumbInitializer'

import BreadCrumbs from './BreadCrumbs.vue'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>

beforeEach(() => {
  store = createTestStore()
})

it('renders slotted breadcrumb', () => {
  const crumb: BreadCrumb = {
    slotName: 'customSlot'
  }
  store.commit('ui/SET_BREAD_CRUMBS', [crumb])
  const wrapper = shallowMount(BreadCrumbs, {
    localVue,
    store,
    slots: {
      customSlot: 'slot-content'
    }
  })

  expect(wrapper.html()).toContain('<div class="breadcrumbs__link">slot-content</div>')
})
