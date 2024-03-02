import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'

import SwitchFolderMode from '@/components/DatasetManagement/Sidebar/SwitchFolderMode.vue'
import dataset, { getInitialState as getInitialDatasetState } from '@/store/modules/dataset'
import { RootState } from '@/store/types'

const localVue = createLocalVue()
localVue.use(Vuex)

const newStore = () => {
  const store = new Vuex.Store<RootState>({
    modules: {
      dataset: { ...dataset, state: getInitialDatasetState() }
    }
  })
  jest.spyOn(store, 'dispatch').mockResolvedValue({})
  return store
}

it('matches snapshot', () => {
  const store = newStore()
  const wrapper = shallowMount(SwitchFolderMode, { localVue, store })
  expect(wrapper).toMatchSnapshot()
})

it('changes view mode when switch layout on sidebar', () => {
  const store = newStore()
  const wrapper = shallowMount(SwitchFolderMode, { localVue, store })

  wrapper.find('icon-button-stub').vm.$emit('click')
  expect(store.dispatch).toHaveBeenCalledWith('dataset/setFolderEnabled', true)
})
