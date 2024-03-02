import { createLocalVue, shallowMount } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { stubDirectiveWithAttribute } from 'test/unit/directiveStubs'
import {
  buildDatasetItemPayload,
  buildDatasetPayload,
  buildMembershipPayload,
  buildWorkflowTemplatePayload
} from 'test/unit/factories'
import { initializeARWorkflow } from 'test/unit/factories/helpers'
import { outOfSubscribedStorageError } from 'test/unit/fixtures/errors'
import { StageItem } from 'test/unit/stubs'
import { emitRootStub } from 'test/unit/testHelpers'

import StageTemplateWithAssignment from '@/components/WorkView/TopBar/Stages/V1/StageTemplateWithAssignment.vue'
import { WorkflowStageTemplatePayload, DatasetItemPayload } from '@/store/types'

const stubs = { StageItem }

const localVue = createLocalVue()

localVue.use(Vuex)
localVue.directive('tooltip', stubDirectiveWithAttribute)

let store: ReturnType<typeof createTestStore>

let propsData: {
  template: WorkflowStageTemplatePayload
}

beforeEach(() => {
  store = createTestStore()

  const item = buildDatasetItemPayload({ id: 1, dataset_id: 1 })
  store.commit('workview/SET_SELECTED_DATASET_ITEM', item)

  const dataset = buildDatasetPayload({ id: 1, default_workflow_template_id: 1 })
  store.commit('workview/SET_DATASET', dataset)

  const template = buildWorkflowTemplatePayload({ id: 1, dataset_id: 1 })
  store.commit('workview/PUSH_WORKFLOW_TEMPLATE', template)

  propsData = {
    template: template.workflow_stage_templates[0]
  }
})

it('matches snapshot', () => {
  const wrapper = shallowMount(StageTemplateWithAssignment, { localVue, propsData, store, stubs })
  expect(wrapper).toMatchSnapshot()
})

it('dispatches to assign stage on assignment selection', async () => {
  const wrapper = shallowMount(StageTemplateWithAssignment, { localVue, propsData, store })
  const member = buildMembershipPayload({ id: 1 })

  const dispatch = store.dispatch as jest.Mock

  dispatch.mockImplementation((action, payload) => {
    if (action === 'workview/createWorkflow') {
      const item = (payload as DatasetItemPayload)
      const [template] = store.state.workview.workflowTemplates
      const itemWithWorkflow = initializeARWorkflow(item, template)
      store.commit('workview/SET_SELECTED_DATASET_ITEM', itemWithWorkflow)
      store.commit('workview/PUSH_DATASET_ITEMS', [itemWithWorkflow])
    }
    return {}
  })

  // selected item will change after dispatch
  const oldItem = store.state.workview.selectedDatasetItem

  await emitRootStub(wrapper, 'assign', member)

  expect(store.dispatch)
    .toHaveBeenCalledWith('workview/createWorkflow', oldItem)

  await flushPromises()

  const stage = store.state.workview.datasetItems[0].current_workflow!.stages[1][0]
  expect(store.dispatch)
    .toHaveBeenCalledWith('workview/assignStage', { stage, userId: member.user_id })
})

it('dispatches and throws error if workflow creation fails', async () => {
  jest.spyOn(store, 'dispatch').mockResolvedValue({ error: { message: 'Fake creation error' } })
  const wrapper = shallowMount(StageTemplateWithAssignment, { localVue, propsData, store })
  const member = buildMembershipPayload({ id: 1 })

  // error throwing is a side-effect of the event handler, so we are forced to test it this way
  expect.assertions(2)
  try {
    await (wrapper.vm as any).assignStage(member)
  } catch (error: unknown) {
    expect(error).toBeTruthy()
  }

  expect(store.dispatch).toHaveBeenCalledWith('toast/warning', { content: 'Fake creation error' })
})

it(`shows storage modal if assignment fails with ${outOfSubscribedStorageError.code}`, async () => {
  jest.spyOn(store, 'dispatch').mockResolvedValue({ error: outOfSubscribedStorageError })

  const wrapper = shallowMount(StageTemplateWithAssignment, { localVue, propsData, store })
  const member = buildMembershipPayload({ id: 1 })
  await emitRootStub(wrapper, 'assign', member)
  await flushPromises()
  expect(store.state.billing.outOfStorageDialogShown).toBe(true)
})

it('only dispatches error if stage assignment fails', async () => {
  const wrapper = shallowMount(StageTemplateWithAssignment, { localVue, propsData, store })
  const member = buildMembershipPayload({ id: 1 })

  const dispatch = store.dispatch as jest.Mock

  dispatch.mockImplementation((action, payload) => {
    if (action === 'workview/createWorkflow') {
      const item = (payload as DatasetItemPayload)
      const [template] = store.state.workview.workflowTemplates
      const itemWithWorkflow = initializeARWorkflow(item, template)
      store.commit('workview/SET_SELECTED_DATASET_ITEM', itemWithWorkflow)
      store.commit('workview/PUSH_DATASET_ITEMS', [itemWithWorkflow])
      return {}
    } else {
      return { error: { message: 'Fake assignment error' } }
    }
  })

  await emitRootStub(wrapper, 'assign', member)
  await flushPromises()
  expect(store.dispatch).toHaveBeenCalledWith('toast/warning', { content: 'Fake assignment error' })
})
