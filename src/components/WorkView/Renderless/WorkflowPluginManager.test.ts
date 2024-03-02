import { createLocalVue, shallowMount } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import {
  buildDatasetPayload,
  buildDatasetItemPayload,
  buildV2DARCWorkflow,
  buildV2WorkflowItemPayload,
  buildV2WorkflowStageInstancePayload
} from 'test/unit/factories'
import { initializeARTemplate, initializeARWorkflow } from 'test/unit/factories/helpers'

import WorkflowPluginManager from '@/components/WorkView/Renderless/WorkflowPluginManager'
import { Editor } from '@/engine/editor'
import { PluginConfig, ItemManager } from '@/engine/managers'
import {
  DatasetItemPayload,
  DatasetPayload,
  StageType,
  V2ReviewStagePayload,
  WorkflowTemplatePayload
} from '@/store/types'
import { ReviewStagePayload } from '@/store/types/WorkflowStagePayload'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>
let propsData: { editor: Editor }

let dataset: DatasetPayload
let workflowTemplate: WorkflowTemplatePayload
let item: DatasetItemPayload

let installAll: jest.SpyInstance
let tutorialPlugins: PluginConfig[]
let annotatePlugins: PluginConfig[]
let reviewPlugins: PluginConfig[]
let viewPlugins: PluginConfig[]

beforeEach(() => {
  dataset = buildDatasetPayload({ id: 5, team_id: 99 })
  workflowTemplate = initializeARTemplate(dataset)

  store = createTestStore()
  store.commit('workview/SET_DATASET', dataset)
  store.commit('workview/PUSH_WORKFLOW_TEMPLATE', workflowTemplate)

  item = buildDatasetItemPayload({ id: 9, dataset_id: dataset.id })
  store.commit('workview/SET_SELECTED_DATASET_ITEM', item)

  const editor = new Editor(new ItemManager(store), store)

  // to avoid issues when switching items on editor
  jest.spyOn(editor.camera, 'scaleToFit').mockReturnValue(undefined)

  store.commit('auth/SET_ABILITIES', [
    { subject: 'all', actions: ['assign_items', 'update_stage'] }
  ])

  installAll = jest.spyOn(editor.pluginManager, 'installAll').mockImplementation(() => {})

  tutorialPlugins = editor.pluginManager.pluginsForTutorial()
  annotatePlugins = editor.pluginManager.pluginsForDataset(dataset, [])
  reviewPlugins = editor.pluginManager.pluginsForReview(dataset, [])
  viewPlugins = editor.pluginManager.pluginsForView()

  propsData = { editor }
})

afterEach(() => {
  installAll.mockReset()
})

describe('in tutorial', () => {
  beforeEach(() => store.commit('workview/SET_TUTORIAL_MODE', true))

  it('loads tutorial plugins', async () => {
    shallowMount(WorkflowPluginManager, { localVue, propsData, store })
    await flushPromises()

    expect(installAll).toHaveBeenCalledWith(tutorialPlugins)
  })
})

describe('when item is archived', () => {
  beforeEach(() => {
    item = buildDatasetItemPayload({ id: 9, dataset_id: dataset.id, archived: true })
    store.commit('workview/SET_SELECTED_DATASET_ITEM', item)

    // template would cause annotate plugins to load, if the item was not archived
    const template = workflowTemplate.workflow_stage_templates[0]
    store.commit('workview/SET_SELECTED_STAGE_TEMPLATE', template)
  })

  it('loads read only plugins', async () => {
    shallowMount(WorkflowPluginManager, { localVue, propsData, store })
    await flushPromises()
    expect(installAll).toHaveBeenCalledWith(viewPlugins)
  })
})

describe('when item has no workflow', () => {
  describe('no stage selected', () => {
    describe('when user cannot self-assign', () => {
      beforeEach(() => store.commit('auth/SET_ABILITIES', []))

      it('loads read only plugins', async () => {
        shallowMount(WorkflowPluginManager, { localVue, propsData, store })
        await flushPromises()
        expect(installAll).toHaveBeenCalledWith(viewPlugins)
      })
    })

    describe('when user can self-assign', () => {
      it('loads annotate plugins', async () => {
        shallowMount(WorkflowPluginManager, { localVue, propsData, store })
        await flushPromises()
        expect(installAll).toHaveBeenCalledWith(annotatePlugins)
      })
    })
  })

  describe('when first stage selected', () => {
    beforeEach(() => {
      const template = workflowTemplate.workflow_stage_templates[0]
      store.commit('workview/SET_SELECTED_STAGE_TEMPLATE', template)
    })

    describe('when user cannot self-assign', () => {
      beforeEach(() => store.commit('auth/SET_ABILITIES', []))

      it('loads read only plugins', async () => {
        shallowMount(WorkflowPluginManager, { localVue, propsData, store })
        await flushPromises()
        expect(installAll).toHaveBeenCalledWith(viewPlugins)
      })
    })

    describe('when user can self-assign', () => {
      it('loads annotate plugins', async () => {
        shallowMount(WorkflowPluginManager, { localVue, propsData, store })
        await flushPromises()
        expect(installAll).toHaveBeenCalledWith(annotatePlugins)
      })
    })
  })

  describe('when future stage selected', () => {
    beforeEach(() => {
      const template = workflowTemplate.workflow_stage_templates[1]
      store.commit('workview/SET_SELECTED_STAGE_TEMPLATE', template)
    })

    it('loads read only plugins', async () => {
      shallowMount(WorkflowPluginManager, { localVue, propsData, store })
      await flushPromises()
      expect(installAll).toHaveBeenCalledWith(viewPlugins)
    })
  })
})

describe('when item has a workflow', () => {
  beforeEach(() => {
    item = initializeARWorkflow(item, workflowTemplate)
    store.commit('workview/PUSH_DATASET_ITEMS', [item])
  })

  describe('no stage selected', () => {
    describe('when user can assign stage', () => {
      it('loads annotate plugins', async () => {
        shallowMount(WorkflowPluginManager, { localVue, propsData, store })
        await flushPromises()
        expect(installAll).toHaveBeenCalledWith(annotatePlugins)
      })
    })

    describe('when user cannot assign stage', () => {
      beforeEach(() => store.commit('auth/SET_ABILITIES', []))

      it('loads read only plugins', async () => {
        shallowMount(WorkflowPluginManager, { localVue, propsData, store })
        await flushPromises()
        expect(installAll).toHaveBeenCalledWith(viewPlugins)
      })
    })
  })

  describe('current annotate stage', () => {
    beforeEach(() => {
      const stage = item.current_workflow!.stages[1][0]
      store.commit('workview/SET_SELECTED_STAGE_INSTANCE', stage)
    })

    it('loads annotate plugins', async () => {
      shallowMount(WorkflowPluginManager, { localVue, propsData, store })
      await flushPromises()
      expect(installAll).toHaveBeenCalledWith(annotatePlugins)
    })

    it('never installs again when same plugins were installed already', async () => {
      shallowMount(WorkflowPluginManager, { localVue, propsData, store })
      await flushPromises()
      expect(installAll).toHaveBeenCalledWith(annotatePlugins)
      const newItem = { ...item, id: 10 }
      store.commit('workview/PUSH_DATASET_ITEMS', [newItem])
      store.commit('workview/SET_SELECTED_DATASET_ITEM', newItem)
      await flushPromises()
      expect(installAll).toHaveBeenCalledTimes(1)
    })
  })

  describe('current read-only review stage', () => {
    beforeEach(() => {
      item.current_workflow!.current_stage_number = 2
      store.commit('workview/PUSH_DATASET_ITEMS', [item])
      const stage = item.current_workflow!.stages[2][0] as ReviewStagePayload
      stage.template_metadata.readonly = true
      store.commit('workview/SET_SELECTED_STAGE_INSTANCE', stage)
    })

    it('loads review plugins', async () => {
      shallowMount(WorkflowPluginManager, { localVue, propsData, store })
      await flushPromises()
      expect(installAll).toHaveBeenCalledWith(reviewPlugins)
    })
  })

  describe('current writable review stage', () => {
    beforeEach(() => {
      item.current_workflow!.current_stage_number = 2
      store.commit('workview/PUSH_DATASET_ITEMS', [item])
      const stage = item.current_workflow!.stages[2][0] as ReviewStagePayload
      stage.template_metadata.readonly = false
      store.commit('workview/SET_SELECTED_STAGE_INSTANCE', stage)
    })

    it('loads annotate plugins', async () => {
      shallowMount(WorkflowPluginManager, { localVue, propsData, store })
      await flushPromises()
      expect(installAll).toHaveBeenCalledWith(annotatePlugins)
    })
  })

  describe('current complete stage', () => {
    beforeEach(() => {
      item.current_workflow!.current_stage_number = 3
      store.commit('workview/PUSH_DATASET_ITEMS', [item])
      const stage = item.current_workflow!.stages[3][0]
      store.commit('workview/SET_SELECTED_STAGE_INSTANCE', stage)
    })

    describe('when user can annotate', () => {
      it('loads annotate plugins', async () => {
        shallowMount(WorkflowPluginManager, { localVue, propsData, store })
        await flushPromises()
        expect(installAll).toHaveBeenCalledWith(annotatePlugins)
      })
    })

    describe('when user cannot annotate', () => {
      beforeEach(() => store.commit('auth/SET_ABILITIES', []))

      it('loads read only plugins', async () => {
        shallowMount(WorkflowPluginManager, { localVue, propsData, store })
        await flushPromises()
        expect(installAll).toHaveBeenCalledWith(viewPlugins)
      })
    })
  })

  describe('past stage', () => {
    beforeEach(() => {
      item.current_workflow!.current_stage_number = 3
      store.commit('workview/PUSH_DATASET_ITEMS', [item])
      const stage = item.current_workflow!.stages[1][0]
      store.commit('workview/SET_SELECTED_STAGE_INSTANCE', stage)
    })

    it('loads read only plugins', async () => {
      shallowMount(WorkflowPluginManager, { localVue, propsData, store })
      await flushPromises()
      expect(installAll).toHaveBeenCalledWith(viewPlugins)
    })
  })

  describe('future stage', () => {
    beforeEach(() => {
      item.current_workflow!.current_stage_number = 1
      store.commit('workview/PUSH_DATASET_ITEMS', [item])
      const stage = item.current_workflow!.stages[3][0]
      store.commit('workview/SET_SELECTED_STAGE_INSTANCE', stage)
    })

    it('loads read only plugins', async () => {
      shallowMount(WorkflowPluginManager, { localVue, propsData, store })
      await flushPromises()
      expect(installAll).toHaveBeenCalledWith(viewPlugins)
    })
  })
})

describe('when item has a 2.0 workflow', () => {
  beforeEach(() => {
    item.workflow_item = buildV2WorkflowItemPayload({
      dataset_item_id: item.id,
      workflow: buildV2DARCWorkflow()
    })

    store.commit('workview/PUSH_DATASET_ITEMS', [item])
    store.commit('workview/SET_SELECTED_DATASET_ITEM', item)
  })

  describe('no stage selected', () => {
    describe('when user can assign stage', () => {
      it('loads annotate plugins', async () => {
        shallowMount(WorkflowPluginManager, { localVue, propsData, store })
        await flushPromises()
        expect(installAll).toHaveBeenCalledWith(annotatePlugins)
      })
    })

    describe('when user cannot assign stage', () => {
      beforeEach(() => store.commit('auth/SET_ABILITIES', []))

      it('loads read only plugins', async () => {
        shallowMount(WorkflowPluginManager, { localVue, propsData, store })
        await flushPromises()
        expect(installAll).toHaveBeenCalledWith(viewPlugins)
      })
    })
  })

  describe('current dataset stage', () => {
    beforeEach(() => {
      const stage = item.workflow_item?.workflow.stages.find(s => s.type === StageType.Dataset)
      const instance = buildV2WorkflowStageInstancePayload({ stage })
      item.workflow_item!.current_stage_instances = [instance]
      store.commit('workview/SET_V2_SELECTED_STAGE_INSTANCE', instance)
    })

    it('loads annotate plugins', async () => {
      shallowMount(WorkflowPluginManager, { localVue, propsData, store })
      await flushPromises()
      expect(installAll).toHaveBeenCalledWith(annotatePlugins)
    })
  })

  describe('current annotate stage', () => {
    beforeEach(() => {
      const stage = item.workflow_item?.workflow.stages.find(s => s.type === StageType.Annotate)
      const instance = buildV2WorkflowStageInstancePayload({ stage })
      item.workflow_item!.current_stage_instances = [instance]
      store.commit('workview/SET_V2_SELECTED_STAGE_INSTANCE', instance)
    })

    it('loads annotate plugins', async () => {
      shallowMount(WorkflowPluginManager, { localVue, propsData, store })
      await flushPromises()
      expect(installAll).toHaveBeenCalledWith(annotatePlugins)
    })

    it('never installs again when same plugins were installed already', async () => {
      shallowMount(WorkflowPluginManager, { localVue, propsData, store })
      await flushPromises()

      expect(installAll).toHaveBeenCalledWith(annotatePlugins)
      const newInstance = { ...item.workflow_item!.current_stage_instances[0], id: 'new_id' }
      store.commit('workview/SET_V2_SELECTED_STAGE_INSTANCE', newInstance)

      await flushPromises()
      expect(installAll).toHaveBeenCalledTimes(1)
    })
  })

  describe('current read-only review stage', () => {
    beforeEach(() => {
      const stage: V2ReviewStagePayload = item.workflow_item?.workflow.stages
        .find(s => s.type === StageType.Review) as V2ReviewStagePayload
      stage.config.readonly = true

      const instance = buildV2WorkflowStageInstancePayload({ stage })
      item.workflow_item!.current_stage_instances = [instance]
      store.commit('workview/SET_V2_SELECTED_STAGE_INSTANCE', instance)
    })

    it('loads review plugins', async () => {
      shallowMount(WorkflowPluginManager, { localVue, propsData, store })
      await flushPromises()
      expect(installAll).toHaveBeenCalledWith(reviewPlugins)
    })
  })

  describe('current writable review stage', () => {
    beforeEach(() => {
      const stage: V2ReviewStagePayload = item.workflow_item?.workflow.stages
        .find(s => s.type === StageType.Review) as V2ReviewStagePayload
      stage.config.readonly = false

      const instance = buildV2WorkflowStageInstancePayload({ stage })
      item.workflow_item!.current_stage_instances = [instance]
      store.commit('workview/SET_V2_SELECTED_STAGE_INSTANCE', instance)
    })

    it('loads annotate plugins', async () => {
      shallowMount(WorkflowPluginManager, { localVue, propsData, store })
      await flushPromises()
      expect(installAll).toHaveBeenCalledWith(annotatePlugins)
    })
  })

  describe('current complete stage', () => {
    beforeEach(() => {
      const stage = item.workflow_item?.workflow.stages.find(s => s.type === StageType.Complete)

      const instance = buildV2WorkflowStageInstancePayload({ stage })
      item.workflow_item!.current_stage_instances = [instance]
      store.commit('workview/SET_V2_SELECTED_STAGE_INSTANCE', instance)
    })

    it('loads view plugins', async () => {
      shallowMount(WorkflowPluginManager, { localVue, propsData, store })
      await flushPromises()
      expect(installAll).toHaveBeenCalledWith(viewPlugins)
    })
  })
})
