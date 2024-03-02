import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'

import { initializeARWorkflow } from 'test/unit/factories/helpers'

import StageAnnotationLoader from '@/components/WorkView/Renderless/StageAnnotationLoader'
import workview, { getInitialState as workviewState } from '@/store/modules/workview'
import { RootState, DatasetItemPayload, WorkflowStagePayload } from '@/store/types'

const localVue = createLocalVue()
localVue.use(Vuex)

const newStore = () => {
  const store = new Vuex.Store<RootState>({
    modules: {
      workview: { ...workview, state: workviewState() }
    }
  })

  jest.spyOn(store, 'dispatch').mockResolvedValue({})
  return store
}

let store: ReturnType<typeof newStore>
let mocks: { $can: () => boolean }
let item: DatasetItemPayload
let stage1: WorkflowStagePayload
let stage2: WorkflowStagePayload

beforeEach(() => {
  store = newStore()

  item = initializeARWorkflow({ id: 72 })
  store.commit('workview/SET_SELECTED_DATASET_ITEM', item)
  store.commit('workview/PUSH_DATASET_ITEMS', [item])

  stage1 = item.current_workflow!.stages[1][0]
  stage2 = item.current_workflow!.stages[2][0]
  store.commit('workview/SET_SELECTED_STAGE_INSTANCE', stage1)
})

it('loads annotations on mount', () => {
  shallowMount(StageAnnotationLoader, { localVue, mocks, store })
  expect(store.dispatch).toHaveBeenCalledWith('workview/loadStageAnnotations', stage1)
})

it('loads annotations on stage selection', async () => {
  const wrapper = shallowMount(StageAnnotationLoader, { localVue, mocks, store })
  store.commit('workview/SET_SELECTED_STAGE_INSTANCE', stage2)
  await wrapper.vm.$nextTick()
  expect(store.dispatch).toHaveBeenCalledWith('workview/loadStageAnnotations', stage2)
})

it('does not trigger additional loads when data other than selected stage id changes', async () => {
  const wrapper = shallowMount(StageAnnotationLoader, { localVue, mocks, store })
  expect(store.dispatch).toHaveBeenCalledTimes(1)
  store.commit('workview/SET_SELECTED_STAGE_INSTANCE', { ...stage1, assignee_id: 55 })
  await wrapper.vm.$nextTick()
  expect(store.dispatch).toHaveBeenCalledTimes(1)
  store.commit('workview/SET_SELECTED_STAGE_INSTANCE', stage2)
  await wrapper.vm.$nextTick()
  expect(store.dispatch).toHaveBeenCalledTimes(2)
})
