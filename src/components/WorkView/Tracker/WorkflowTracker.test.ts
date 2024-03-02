import { createLocalVue, shallowMount, Wrapper } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import {
  buildDatasetItemPayload,
  buildUserPayload,
  buildWorkflowStagePayload,
  buildWorkflowTemplatePayload,
  buildDatasetPayload,
  buildWorkflowStageTemplatePayload
} from 'test/unit/factories'
import { initializeARWorkflow } from 'test/unit/factories/helpers'

import WorkflowTracker from '@/components/WorkView/Tracker/WorkflowTracker.vue'
import { StageType } from '@/store/types'

const localVue = createLocalVue()
localVue.use(Vuex)

let selectedItem: ReturnType<typeof initializeARWorkflow>

let store: ReturnType<typeof createTestStore>

const getTopic = (wrapper: Wrapper<Vue>) =>
  wrapper.find('work-tracker-stub').attributes('topic')

beforeEach(() => {
  selectedItem = initializeARWorkflow({ id: 1 })
  store = createTestStore()
  store.commit('workview/SET_SELECTED_DATASET_ITEM', selectedItem)
  store.commit('workview/SET_SELECTED_STAGE_INSTANCE', selectedItem.current_workflow!.stages[1][0])
  store.commit('workview/PUSH_DATASET_ITEMS', [selectedItem])
  store.commit('user/SET_PROFILE', buildUserPayload({ id: 99 }))
})

it('matches snapshot', () => {
  const wrapper = shallowMount(WorkflowTracker, { localVue, store })
  expect(wrapper).toMatchSnapshot()
})

it("matches snapshot when there's no topic", () => {
  store.commit('workview/SET_SELECTED_STAGE_INSTANCE', buildWorkflowStagePayload({ id: 5 }))
  const wrapper = shallowMount(WorkflowTracker, { localVue, store })
  expect(wrapper).toMatchSnapshot()
})

it('reports activity on select store actions, while component is alive', () => {
  const actions = [
    'workview/approveStage',
    'workview/archiveStage',
    'workview/rejectStage',
    'workview/cancelStageAutoComplete',
    'workview/createWorkflow'
  ]

  // We are testing subscribeAction here, to make sure it subscribes
  // to correct actions. To achieve this, we need to mock a custom store
  // which has passthrough actions
  const store = new Vuex.Store({
    state: { workview: {} },
    actions: {
      ...Object.fromEntries(actions.map(a => [a, () => { }])),
      'workviewTracker/reportActivity': () => { }
    }
  })
  const dispatch = jest.spyOn(store, 'dispatch')
  const wrapper = shallowMount(WorkflowTracker, { localVue, store })

  actions.forEach(action => store.dispatch(action))

  expect(
    dispatch.mock.calls.filter(([action]) =>
      typeof action === 'string' && action === 'workviewTracker/reportActivity'
    )
  ).toHaveLength(actions.length)

  dispatch.mockClear()
  wrapper.destroy()
  actions.forEach(action => store.dispatch(action))
  expect(
    dispatch.mock.calls.filter(([action]) =>
      typeof action === 'string' && action === 'workviewTracker/reportActivity'
    )
  ).toHaveLength(0)
})

it('subscribes to store actions, unsubscribes on cleanup', () => {
  const unsubscribe = jest.fn()
  const subscribe = jest.spyOn(store, 'subscribeAction').mockImplementation(() => unsubscribe)
  const wrapper = shallowMount(WorkflowTracker, { localVue, store })
  expect(subscribe).toHaveBeenCalledTimes(1)
  expect(unsubscribe).toHaveBeenCalledTimes(0)
  wrapper.destroy()
  expect(unsubscribe).toHaveBeenCalledTimes(1)
})

describe('When the V2 feature flag is off', () => {
  it('sets topic when item', () => {
    const item =
      buildDatasetItemPayload({ id: 5, current_workflow: null, current_workflow_id: null })
    store.commit('workview/SET_SELECTED_DATASET_ITEM', item)
    store.commit('workview/SET_SELECTED_STAGE_INSTANCE', null)

    const wrapper = shallowMount(WorkflowTracker, { localVue, store })
    expect(getTopic(wrapper)).toEqual(`workview:annotate:item:${item.id}`)
  })

  it('sets topic to first stage type when item with custom template', () => {
    const dataset = buildDatasetPayload({ id: 9, default_workflow_template_id: 8 })
    store.commit('workview/SET_DATASET', dataset)
    const template = buildWorkflowTemplatePayload({
      dataset_id: dataset.id,
      id: 8,
      workflow_stage_templates: [
        buildWorkflowStageTemplatePayload({ id: 1, stage_number: 3, type: StageType.Annotate }),
        buildWorkflowStageTemplatePayload({ id: 1, stage_number: 1, type: StageType.Review }),
        buildWorkflowStageTemplatePayload({ id: 1, stage_number: 2, type: StageType.Complete })
      ]
    })
    store.commit('workview/PUSH_WORKFLOW_TEMPLATE', template)

    const item =
      buildDatasetItemPayload({ id: 5, current_workflow: null, current_workflow_id: null })
    store.commit('workview/SET_SELECTED_DATASET_ITEM', item)
    store.commit('workview/SET_SELECTED_STAGE_INSTANCE', null)

    const wrapper = shallowMount(WorkflowTracker, { localVue, store })
    expect(getTopic(wrapper)).toEqual(`workview:review:item:${item.id}`)
  })

  it('sets topic when item with tag template', () => {
    const dataset = buildDatasetPayload({ id: 9, default_workflow_template_id: 8 })
    store.commit('workview/SET_DATASET', dataset)
    const template = buildWorkflowTemplatePayload({
      dataset_id: dataset.id,
      id: 8,
      workflow_stage_templates: [
        // tag template because only stage is complete
        buildWorkflowStageTemplatePayload({ id: 1, stage_number: 1, type: StageType.Complete })
      ]
    })
    store.commit('workview/PUSH_WORKFLOW_TEMPLATE', template)

    const item =
      buildDatasetItemPayload({ id: 5, current_workflow: null, current_workflow_id: null })
    store.commit('workview/SET_SELECTED_DATASET_ITEM', item)
    store.commit('workview/SET_SELECTED_STAGE_INSTANCE', null)

    const wrapper = shallowMount(WorkflowTracker, { localVue, store })
    expect(getTopic(wrapper)).toEqual(`workview:annotate:item:${item.id}`)
  })

  it('sets topic when item with invalid template', () => {
    const dataset = buildDatasetPayload({ id: 9, default_workflow_template_id: 8 })
    store.commit('workview/SET_DATASET', dataset)
    const template = buildWorkflowTemplatePayload({
      dataset_id: dataset.id,
      id: 8,
      workflow_stage_templates: [
        // invalid because there's no stage template 1
        buildWorkflowStageTemplatePayload({ id: 1, stage_number: 3, type: StageType.Annotate })
      ]
    })
    store.commit('workview/PUSH_WORKFLOW_TEMPLATE', template)

    const item =
      buildDatasetItemPayload({ id: 5, current_workflow: null, current_workflow_id: null })
    store.commit('workview/SET_SELECTED_DATASET_ITEM', item)
    store.commit('workview/SET_SELECTED_STAGE_INSTANCE', null)

    const wrapper = shallowMount(WorkflowTracker, { localVue, store })
    expect(getTopic(wrapper)).toEqual(`workview:annotate:item:${item.id}`)
  })

  it('sets topic when annotate stage', () => {
    const stage = selectedItem.current_workflow!.stages[1][0]
    const wrapper = shallowMount(WorkflowTracker, { localVue, store })
    expect(getTopic(wrapper)).toEqual(`workview:annotate:stage:${stage.id}`)
  })

  it('sets topic when review stage', () => {
    selectedItem.current_workflow!.current_stage_number = 2
    store.commit('workview/SET_SELECTED_DATASET_ITEM', selectedItem)
    const stage = selectedItem.current_workflow!.stages[2][0]
    store.commit('workview/SET_SELECTED_STAGE_INSTANCE', stage)

    const wrapper = shallowMount(WorkflowTracker, { localVue, store })
    expect(getTopic(wrapper)).toEqual(`workview:review:stage:${stage.id}`)
  })

  it('ignores selection of stage instances which are not current', async () => {
    store.commit('user/SET_PROFILE', buildUserPayload({ id: 8 }))
    const wrapper = shallowMount(WorkflowTracker, { localVue, store })

    const { stages } = selectedItem.current_workflow!

    await store.commit('workview/SET_SELECTED_STAGE_INSTANCE', stages[1][0])
    expect(getTopic(wrapper)).toEqual(`workview:annotate:stage:${stages[1][0].id}`)

    await store.commit('workview/SET_SELECTED_STAGE_INSTANCE', stages[2][0])
    expect(getTopic(wrapper)).toBeUndefined()

    await store.commit('workview/SET_SELECTED_STAGE_INSTANCE', stages[3][0])
    expect(getTopic(wrapper)).toBeUndefined()
  })

  it('ignores selection of complete stage instances even when current', async () => {
    store.commit('user/SET_PROFILE', buildUserPayload({ id: 8 }))
    const wrapper = shallowMount(WorkflowTracker, { localVue, store })

    selectedItem.current_workflow!.current_stage_number = 3
    const { stages } = selectedItem.current_workflow!

    await store.commit('workview/SET_SELECTED_STAGE_INSTANCE', stages[3][0])
    expect(getTopic(wrapper)).toBeUndefined()
  })
})
