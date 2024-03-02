import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import {
  buildDatasetItemPayload,
  buildDatasetPayload,
  buildUserPayload,
  buildWorkflowStagePayload
} from 'test/unit/factories'
import { initializeARTemplate, initializeARWorkflow } from 'test/unit/factories/helpers'

import StageSelector from '@/components/WorkView/Renderless/StageSelector'
import { DatasetItemPayload } from '@/store/types'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>

const sfh = buildDatasetPayload({ default_workflow_template_id: 2, id: 1, name: 'SFH' })
const sfhTemplate = initializeARTemplate(sfh)
sfh.default_workflow_template_id = sfhTemplate.id

beforeEach(() => {
  store = createTestStore()
  store.commit('workview/SET_DATASET', sfh)
})

describe('item with active workflow', () => {
  let item: DatasetItemPayload

  beforeEach(() => {
    item = initializeARWorkflow({ id: 3 })
    item.current_workflow!.stages[2].push(buildWorkflowStagePayload({ assignee_id: 1 }))
    item.current_workflow!.current_stage_number = 2
    store.commit('workview/SET_SELECTED_DATASET_ITEM', item)
  })

  it('selects user-assigned instance in current stage of workflow', () => {
    store.commit('user/SET_PROFILE', buildUserPayload({ id: 1 }))

    shallowMount(StageSelector, { localVue, store })
    expect(store.state.workview.selectedStageTemplate).toEqual(null)

    expect(store.state.workview.selectedStageInstance)
      .toEqual(item.current_workflow!.stages[2][1])
  })

  it('selects first instance in current stage of workflow', () => {
    shallowMount(StageSelector, { localVue, store })
    expect(store.state.workview.selectedStageTemplate).toEqual(null)

    expect(store.state.workview.selectedStageInstance)
      .toEqual(item.current_workflow!.stages[2][0])
  })
})

describe('item without workflow, default worflow template available', () => {
  let item: DatasetItemPayload

  beforeEach(() => {
    item = buildDatasetItemPayload({ id: 3, dataset_id: 1 })
    store.commit('workview/SET_SELECTED_DATASET_ITEM', item)
    store.commit('workview/PUSH_WORKFLOW_TEMPLATE', sfhTemplate)
  })

  it('selects template with stage number 1 in default workflow', () => {
    shallowMount(StageSelector, { localVue, store })
    expect(store.state.workview.selectedStageTemplate)
      .toEqual(sfhTemplate.workflow_stage_templates[0])
    expect(store.state.workview.selectedStageInstance).toEqual(null)
  })

  it('selects template with stage number 1 even if templates are unordered', () => {
    const unordered = [
      sfhTemplate.workflow_stage_templates[2],
      sfhTemplate.workflow_stage_templates[1],
      sfhTemplate.workflow_stage_templates[0]
    ]
    store.commit('workview/PUSH_WORKFLOW_TEMPLATE', {
      ...sfhTemplate,
      workflow_stage_templates: unordered
    })

    shallowMount(StageSelector, { localVue, store })
    expect(store.state.workview.selectedStageTemplate)
      .toEqual(sfhTemplate.workflow_stage_templates[0])

    expect(store.state.workview.selectedStageInstance).toEqual(null)
  })
})

describe('item without workflow, no worflow template available', () => {
  let item: DatasetItemPayload

  beforeEach(() => {
    item = buildDatasetItemPayload({ id: 3, dataset_id: 1 })
    store.commit('workview/SET_SELECTED_DATASET_ITEM', item)
    store.commit('workview/SET_SELECTED_STAGE_TEMPLATE', sfhTemplate.workflow_stage_templates[0])
    store.commit('workview/SET_SELECTED_STAGE_INSTANCE', buildWorkflowStagePayload())
  })

  it('sets template and instance to null', () => {
    shallowMount(StageSelector, { localVue, store })
    expect(store.state.workview.selectedStageInstance).toEqual(null)
    expect(store.state.workview.selectedStageTemplate).toEqual(null)
  })
})
