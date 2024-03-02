import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'

import BreadCrumbs from '@/components/Common/BreadCrumbs/V1/BreadCrumbs.vue'
import { BreadCrumb } from '@/mixins/BreadCrumbInitializer'
import ui, { getInitialState as getInitialUIState } from '@/store/modules/ui'
import { RootState } from '@/store/types'

const localVue = createLocalVue()
localVue.use(Vuex)

const stubs = ['router-link']

const newStore = (breadCrumbs: BreadCrumb[] = []) => {
  const store = new Vuex.Store<RootState>({
    modules: {
      ui: { ...ui, state: { ...getInitialUIState(), breadCrumbs } }
    }
  })
  jest.spyOn(store, 'dispatch').mockResolvedValue({})
  return store
}

it('renders breadcrumbs', () => {
  const store = newStore([
    { name: 'Home (no link)' },
    { name: 'Level 1', to: 'level-1' },
    { name: 'Level 2', to: 'level-2' },
    { name: 'Here (no link)' }
  ])
  const wrapper = shallowMount(BreadCrumbs, { localVue, store, stubs })
  expect(wrapper).toMatchSnapshot()
})
