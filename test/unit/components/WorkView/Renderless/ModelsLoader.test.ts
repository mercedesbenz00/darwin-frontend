import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'

import ModelsLoader from '@/components/WorkView/Renderless/ModelsLoader'

const localVue = createLocalVue()
localVue.use(Vuex)

it('load neurals models', () => {
  const store = createTestStore()
  shallowMount(ModelsLoader, { localVue, store })
  expect(store.dispatch).toHaveBeenCalledWith('workview/loadAutoAnnotateModels')
})
