import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'

import { buildDatasetItemPayload } from 'test/unit/factories'

import TimeSummaryLoader from '@/components/WorkView/Renderless/TimeSummaryLoader'
import workview, { getInitialState as workviewState } from '@/store/modules/workview'
import { WorkflowStagePayload, DatasetItemPayload } from '@/store/types'

const localVue = createLocalVue()
localVue.use(Vuex)

const newStore = () => {
  const store = new Vuex.Store({
    modules: {
      workview: { ...workview, state: workviewState() }
    }
  })

  jest.spyOn(store, 'dispatch').mockResolvedValue({})
  return store
}

let propsData: { stage: WorkflowStagePayload }
let store: ReturnType<typeof newStore>
let item: DatasetItemPayload

beforeEach(() => {
  item = buildDatasetItemPayload({ id: 321 })
  store = newStore()
  store.commit('workview/SET_SELECTED_DATASET_ITEM', item)
})

it('dispatches loading summary on mount', () => {
  shallowMount(TimeSummaryLoader, { localVue, propsData, store })
  expect(store.dispatch).toHaveBeenCalledWith('workview/loadTimeSummary', item)
})

it('dispatches loading summary on item selection change', async () => {
  const wrapper = shallowMount(TimeSummaryLoader, { localVue, propsData, store })
  const item2 = buildDatasetItemPayload({ id: 333 })
  store.commit('workview/SET_SELECTED_DATASET_ITEM', item2)
  await wrapper.vm.$nextTick()
  expect(store.dispatch).toHaveBeenCalledWith('workview/loadTimeSummary', item2)
})
