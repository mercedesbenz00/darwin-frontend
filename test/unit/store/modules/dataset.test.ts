import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import {
  buildAxiosResponse,
  buildDatasetPayload,
  buildUserPayload,
  buildDatasetAnnotatorPayload,
  buildWorkflowTemplatePayload,
  buildDatasetExportPayload,
  buildDatasetItemPayload
} from 'test/unit/factories'
import { initializeARTemplate, initializeARWorkflow } from 'test/unit/factories/helpers'
import { mockApi } from 'test/unit/mocks/mockApi'

import dataset, { getInitialState as datasetState } from '@/store/modules/dataset'
import { updateWorkflowStageTemplate } from '@/store/modules/dataset/actions/updateWorkflowStageTemplate'
import features, { getInitialState as featuresState } from '@/store/modules/features'
import team, { getInitialState as teamState } from '@/store/modules/team'
import {
  AnnotateStageTemplatePayload,
  DatasetExportPayload,
  DatasetItemPayload,
  DatasetItemStatus,
  RootState,
  StageType,
  StoreActionPayload,
  WorkflowTemplatePayload
} from '@/store/types'
import { api, errorsByCode, errorMessages } from '@/utils'

mockApi()

const localVue = createLocalVue()
localVue.use(Vuex)

const newStore = () =>
  new Vuex.Store<RootState>({
    modules: {
      dataset: { ...dataset, state: datasetState() },
      features: { ...features, state: featuresState() },
      team: { ...team, state: teamState() }
    }
  })

const sfh = buildDatasetPayload({ id: 1, slug: 'sfh', name: 'SFH' })
const birds = buildDatasetPayload({ id: 2, slug: 'birds', name: 'Birds' })

const sam = buildUserPayload({ id: 1, email: 'sam@v7labs.com' })
const jim = buildUserPayload({ id: 2, email: 'jim@v7labs.com' })

const samSfhAnnotator = buildDatasetAnnotatorPayload({ id: 1, user_id: sam.id, dataset_id: sfh.id })
const jimSfhAnnotator = buildDatasetAnnotatorPayload({ id: 2, user_id: jim.id, dataset_id: sfh.id })

const samBirdsAnnotator =
  buildDatasetAnnotatorPayload({ id: 3, user_id: sam.id, dataset_id: birds.id })
const jimBirdsAnnotator =
  buildDatasetAnnotatorPayload({ id: 4, user_id: jim.id, dataset_id: birds.id })

const unauthorizedError = { response: { status: 401 } }

let store: ReturnType<typeof newStore>

beforeEach(() => { store = newStore() })

describe('dataset/getAnnotators', () => {
  it('calls correct api endpoint', async () => {
    jest.spyOn(api, 'get').mockResolvedValue(buildAxiosResponse({ data: [samSfhAnnotator, jimSfhAnnotator] }))

    await store.dispatch('dataset/getAnnotators', { datasetId: sfh.id })
    expect(api.get).toHaveBeenCalledWith(`datasets/${sfh.id}/annotators`)
  })

  it('returns raw data from backend', async () => {
    jest.spyOn(api, 'get').mockResolvedValue(buildAxiosResponse({ data: [samSfhAnnotator, jimSfhAnnotator] }))

    const { data } = await store.dispatch('dataset/getAnnotators', { datasetId: sfh.id })
    expect(data).toEqual([samSfhAnnotator, jimSfhAnnotator])
  })

  it('commits annotators to store', async () => {
    jest.spyOn(api, 'get').mockResolvedValue(buildAxiosResponse({ data: [samSfhAnnotator, jimSfhAnnotator] }))
    await store.dispatch('dataset/getAnnotators', { datasetId: sfh.id })
    expect(store.state.dataset.annotators).toEqual([samSfhAnnotator, jimSfhAnnotator])
  })
})

describe('dataset/deleteExport', () => {
  let datasetExportPayload: DatasetExportPayload

  beforeEach(() => {
    jest.spyOn(api, 'remove').mockResolvedValue(buildAxiosResponse({ data: {} }))
    datasetExportPayload = buildDatasetExportPayload({ name: 'version' })
    store.commit('dataset/SET_DATASET_EXPORTS', [datasetExportPayload])
  })

  it('calls correct backend endpoint', async () => {
    await store.dispatch('dataset/deleteExport', { datasetId: 1, name: datasetExportPayload.name })
    expect(api.remove).toHaveBeenCalledWith(`datasets/1/exports/${datasetExportPayload.name}`)
  })

  it('removes report from the store', async () => {
    expect(store.state.dataset.datasetExports).toHaveLength(1)
    await store.dispatch('dataset/deleteExport', { datasetId: 1, name: datasetExportPayload.name })
    expect(store.state.dataset.datasetExports).toHaveLength(0)
  })

  it('returns parsed error on error', async () => {
    jest.spyOn(api, 'remove').mockRejectedValue(unauthorizedError)

    const { error } = await store.dispatch('dataset/deleteExport', { datasetId: 1, name: datasetExportPayload.name })

    expect(error).toEqual(
      expect.objectContaining({
        status: 401,
        message: errorMessages.DATASET_EXPORT[401]
      })
    )
  })
})

describe('dataset/updateWorkflowStageTemplate', () => {
  let workflowTemplate: WorkflowTemplatePayload
  let template: AnnotateStageTemplatePayload
  let payload: StoreActionPayload<typeof updateWorkflowStageTemplate>
  let updatedTemplate: AnnotateStageTemplatePayload

  beforeEach(() => {
    workflowTemplate = initializeARTemplate()
    store.commit('dataset/PUSH_WORKFLOW_TEMPLATE', workflowTemplate)

    template = workflowTemplate.workflow_stage_templates[0] as AnnotateStageTemplatePayload

    payload = {
      assignees: [
        { id: 1, samplingRate: 1 },
        { id: 2, samplingRate: 1 },
        { id: 3, samplingRate: 1 }
      ],
      metadata: {
        assignable_to: 'manual',
        readonly: true,
        base_sampling_rate: 1,
        user_sampling_rate: 1
      },
      name: 'Foo',
      stageId: template.id
    }

    updatedTemplate = {
      ...template,
      workflow_stage_template_assignees: payload.assignees
        .map(a => ({ assignee_id: a.id, sampling_rate: a.samplingRate })),
      metadata: payload.metadata as AnnotateStageTemplatePayload['metadata']
    }

    jest.spyOn(api, 'put').mockResolvedValue(buildAxiosResponse({ data: updatedTemplate }))
  })

  it('sends request to api', async () => {
    await store.dispatch('dataset/updateWorkflowStageTemplate', payload)
    expect(api.put).toHaveBeenCalledWith(
      `workflow_stage_templates/${template.id}`, {
        id: payload.stageId,
        workflow_stage_template_assignees: updatedTemplate.workflow_stage_template_assignees,
        metadata: payload.metadata,
        name: payload.name
      }
    )
  })

  it('returns data retrieved from endpoint', async () => {
    const { data } = await store.dispatch('dataset/updateWorkflowStageTemplate', payload)
    expect(data).toEqual(updatedTemplate)
  })

  it('commits template to store', async () => {
    expect(store.state.dataset.workflowTemplates[0].workflow_stage_templates[0])
      .toEqual(template)

    await store.dispatch('dataset/updateWorkflowStageTemplate', payload)
    expect(store.state.dataset.workflowTemplates[0].workflow_stage_templates[0])
      .toEqual(updatedTemplate)
  })

  it('returns error on request failure', async () => {
    jest.spyOn(api, 'put').mockRejectedValue(unauthorizedError)

    const { error } = await store.dispatch('dataset/updateWorkflowStageTemplate', payload)

    expect(error).toEqual(
      expect.objectContaining({
        status: 401,
        message: errorsByCode.WORKFLOW_UPDATE_NOT_AUTHORIZED
      })
    )
  })
})

describe('dataset/loadWorkflowTemplates', () => {
  let workflowTemplate: WorkflowTemplatePayload

  beforeEach(() => {
    store.commit('dataset/PUSH_DATASET', sfh)
    workflowTemplate = initializeARTemplate(sfh)
    jest.spyOn(api, 'get').mockResolvedValue(buildAxiosResponse({ data: [workflowTemplate] }))
  })

  it('sends request to api', async () => {
    await store.dispatch('dataset/loadWorkflowTemplates', sfh)
    expect(api.get).toHaveBeenCalledWith(`datasets/${sfh.id}/workflow_templates`)
  })

  it('commits template to store', async () => {
    await store.dispatch('dataset/loadWorkflowTemplates', sfh)
    expect(store.state.dataset.workflowTemplates[0]).toBeDefined()
    expect(store.state.dataset.workflowTemplates[0]).toEqual(workflowTemplate)
  })

  it('returns error on request failure', async () => {
    jest.spyOn(api, 'get').mockRejectedValue(unauthorizedError)

    const { error } = await store.dispatch('dataset/loadWorkflowTemplates', sfh)

    expect(error).toEqual(
      expect.objectContaining({
        status: 401,
        message: errorsByCode.WORKFLOW_TEMPLATES_LOAD_NOT_AUTHORIZED
      })
    )
  })
})

describe('dataset/createWorkflowTemplate', () => {
  let workflowTemplate: WorkflowTemplatePayload

  beforeEach(() => {
    workflowTemplate = initializeARTemplate(sfh)
    jest.spyOn(api, 'post').mockResolvedValue(buildAxiosResponse({ data: workflowTemplate }))
  })

  it('sends request to api', async () => {
    const { name, ...params } = workflowTemplate
    await store.dispatch('dataset/createWorkflowTemplate', params)
    expect(api.post).toHaveBeenCalledWith(
      `datasets/${sfh.id}/workflow_templates`,
      {
        dataset_id: sfh.id,
        workflow_stage_templates: [
          {
            workflow_stage_template_assignees: [],
            metadata: {
              assignable_to: 'anyone',
              base_sampling_rate: 1,
              user_sampling_rate: 1
            },
            name: null,
            stage_number: 1,
            type: StageType.Annotate
          },
          {
            workflow_stage_template_assignees: [],
            metadata: {
              assignable_to: 'anyone',
              readonly: false,
              base_sampling_rate: 1,
              user_sampling_rate: 1
            },
            name: null,
            stage_number: 2,
            type: StageType.Review
          }
        ]
      }
    )
  })

  it('commits template to store', async () => {
    const { name, ...params } = workflowTemplate
    await store.dispatch('dataset/createWorkflowTemplate', params)
    expect(store.state.dataset.workflowTemplates[0]).toBeDefined()
    expect(store.state.dataset.workflowTemplates[0]).toEqual(workflowTemplate)
  })

  it('returns error on request failure', async () => {
    jest.spyOn(api, 'post').mockRejectedValue(unauthorizedError)

    const { name, ...params } = workflowTemplate
    const { error } = await store.dispatch('dataset/createWorkflowTemplate', params)

    expect(error).toEqual(
      expect.objectContaining({
        status: 401,
        message: errorsByCode.WORKFLOW_TEMPLATE_CREATE_NOT_AUTHORIZED
      })
    )
  })
})

describe('dataset/setDefaultWorkflowTemplate', () => {
  let workflowTemplate: WorkflowTemplatePayload

  beforeEach(() => {
    store.commit('dataset/PUSH_DATASET', sfh)
    workflowTemplate = initializeARTemplate(sfh)
    store.commit('dataset/PUSH_WORKFLOW_TEMPLATE', workflowTemplate)
    jest.spyOn(api, 'put').mockResolvedValue(buildAxiosResponse({ data: workflowTemplate }))
  })

  it('sends request to api', async () => {
    await store.dispatch('dataset/setDefaultWorkflowTemplate', workflowTemplate)
    expect(api.put).toHaveBeenCalledWith(`datasets/${sfh.id}/default_workflow_template/${workflowTemplate.id}`, {})
  })

  it('commits template to store', async () => {
    await store.dispatch('dataset/setDefaultWorkflowTemplate', workflowTemplate)
    expect(store.state.dataset.datasets[0].default_workflow_template_id).toEqual(workflowTemplate.id)
  })

  it('returns error on request failure', async () => {
    jest.spyOn(api, 'put').mockRejectedValue(unauthorizedError)

    const { error } = await store.dispatch('dataset/setDefaultWorkflowTemplate', workflowTemplate)

    expect(error).toEqual(
      expect.objectContaining({
        status: 401,
        message: errorsByCode.WORKFLOW_TEMPLATE_SET_DEFAULT_NOT_AUTHORIZED
      })
    )
  })
})

// mutations

describe('dataset/PUSH_ANNOTATORS_FOR_DATASET', () => {
  it('adds all annotators from payload if state is empty', () => {
    store.commit('dataset/PUSH_ANNOTATORS_FOR_DATASET', {
      datasetId: sfh.id, data: [samSfhAnnotator, jimSfhAnnotator]
    })
    expect(store.state.dataset.annotators).toEqual([samSfhAnnotator, jimSfhAnnotator])
  })

  it('replaces all annotators if only annotators for same dataset are in state', () => {
    store.commit('dataset/PUSH_ANNOTATORS_FOR_DATASET', {
      datasetId: sfh.id, data: [samSfhAnnotator]
    })
    store.commit('dataset/PUSH_ANNOTATORS_FOR_DATASET', {
      datasetId: sfh.id, data: [jimSfhAnnotator]
    })
    expect(store.state.dataset.annotators).toEqual([jimSfhAnnotator])
  })

  it('adds to existing annotators for dataset', () => {
    store.commit('dataset/PUSH_ANNOTATORS_FOR_DATASET', {
      datasetId: sfh.id, data: [samSfhAnnotator]
    })

    store.commit('dataset/PUSH_ANNOTATORS_FOR_DATASET', {
      datasetId: sfh.id, data: [samSfhAnnotator, jimSfhAnnotator]
    })
    expect(store.state.dataset.annotators).toEqual([samSfhAnnotator, jimSfhAnnotator])
  })

  it('does not touch annotators for other datasets', () => {
    store.commit('dataset/PUSH_ANNOTATORS_FOR_DATASET', {
      datasetId: sfh.id,
      data: [samBirdsAnnotator, jimBirdsAnnotator, samSfhAnnotator, jimSfhAnnotator]
    })

    store.commit('dataset/PUSH_ANNOTATORS_FOR_DATASET', {
      datasetId: sfh.id, data: [jimSfhAnnotator]
    })

    expect(store.state.dataset.annotators)
      .toEqual([samBirdsAnnotator, jimBirdsAnnotator, jimSfhAnnotator])

    store.commit('dataset/PUSH_ANNOTATORS_FOR_DATASET', { datasetId: birds.id, data: [] })

    expect(store.state.dataset.annotators).toEqual([jimSfhAnnotator])
  })
})

describe('dataset/PUSH_WORKFLOW_TEMPLATES', () => {
  it('push new workflow templates', () => {
    expect(store.state.dataset.workflowTemplates).toHaveLength(0)
    store.commit('dataset/PUSH_WORKFLOW_TEMPLATES', [buildWorkflowTemplatePayload({ id: 1, name: 'original' })])
    expect(store.state.dataset.workflowTemplates).toHaveLength(1)
    expect(store.state.dataset.workflowTemplates[0].name).toEqual('original')
    store.commit(
      'dataset/PUSH_WORKFLOW_TEMPLATES',
      [
        buildWorkflowTemplatePayload({ id: 1, name: 'new1' }),
        buildWorkflowTemplatePayload({ id: 2, name: 'new2' })
      ]
    )
    expect(store.state.dataset.workflowTemplates).toHaveLength(2)
    expect(store.state.dataset.workflowTemplates[0].name).toEqual('new1')
  })
})

describe('dataset/UPDATE_DATASET_DEFAULT_WORKFLOW_TEMPLATE', () => {
  beforeEach(() => {
    store.commit('dataset/PUSH_DATASET', buildDatasetPayload({ id: 1, default_workflow_template_id: 1 }))
  })

  it('updates the default workflow template of dataset', () => {
    expect(store.state.dataset.datasets[0].default_workflow_template_id).toBe(1)
    store.commit(
      'dataset/UPDATE_DATASET_DEFAULT_WORKFLOW_TEMPLATE',
      { dataset_id: 1, id: 2 }
    )
    expect(store.state.dataset.datasets[0].default_workflow_template_id).toBe(2)
  })
})

describe('dataset/DELETE_EXPORT', () => {
  beforeEach(() => {
    store.commit('dataset/SET_DATASET_EXPORTS', [buildDatasetExportPayload({ name: 'test' })])
  })

  it('removes the export from the store', () => {
    expect(store.state.dataset.datasetExports).toHaveLength(1)
    store.commit('dataset/DELETE_EXPORT', 'test')
    expect(store.state.dataset.datasetExports).toHaveLength(0)
  })
})

describe('dataset/SET_STAGE_NUMBER', () => {
  let items: DatasetItemPayload[]

  beforeEach(() => {
    items = [
      initializeARWorkflow({ id: 1 }),
      initializeARWorkflow({ id: 2 }),
      initializeARWorkflow({ id: 3 })
    ]
    store.commit('dataset/PUSH_DATASET_ITEMS', items)
  })

  it('sets stage number on given items', () => {
    store.commit('dataset/SET_STAGE_NUMBER', { items, stageNumber: 2 })
    expect(items[0].current_workflow!.current_stage_number).toEqual(2)
    expect(items[1].current_workflow!.current_stage_number).toEqual(2)
    expect(items[2].current_workflow!.current_stage_number).toEqual(2)
  })

  it('ignores items which are not specified', () => {
    store.commit('dataset/SET_STAGE_NUMBER', { items: [items[1]], stageNumber: 2 })
    expect(items[0].current_workflow!.current_stage_number).not.toEqual(2)
    expect(items[1].current_workflow!.current_stage_number).toEqual(2)
    expect(items[2].current_workflow!.current_stage_number).not.toEqual(2)
  })

  it('ignores items without workflows', () => {
    const item = buildDatasetItemPayload({ id: 4 })
    store.commit('dataset/PUSH_DATASET_ITEMS', [item])
    store.commit('dataset/SET_STAGE_NUMBER', { items: [item], stageNumber: 2 })
    expect(item.current_workflow).toBeNull()
  })
})

describe('dataset/SET_ITEM_STATUS', () => {
  let items: DatasetItemPayload[]

  beforeEach(() => {
    items = [
      initializeARWorkflow({ id: 1 }),
      initializeARWorkflow({ id: 2 }),
      initializeARWorkflow({ id: 3 })
    ]
    store.commit('dataset/PUSH_DATASET_ITEMS', items)
  })

  it('sets status on given items', () => {
    store.commit('dataset/SET_ITEM_STATUS', { items, status: DatasetItemStatus.review })
    expect(items[0]!.status).toEqual(DatasetItemStatus.review)
    expect(items[1]!.status).toEqual(DatasetItemStatus.review)
    expect(items[2]!.status).toEqual(DatasetItemStatus.review)
    expect(items[0].current_workflow!.status).toEqual(DatasetItemStatus.review)
    expect(items[1].current_workflow!.status).toEqual(DatasetItemStatus.review)
    expect(items[2].current_workflow!.status).toEqual(DatasetItemStatus.review)
  })

  it('ignores items which are not specified', () => {
    store.commit('dataset/SET_ITEM_STATUS', { items: [items[1]], status: DatasetItemStatus.review })
    expect(items[0]!.status).not.toEqual(DatasetItemStatus.review)
    expect(items[1]!.status).toEqual(DatasetItemStatus.review)
    expect(items[2]!.status).not.toEqual(DatasetItemStatus.review)
  })
})
