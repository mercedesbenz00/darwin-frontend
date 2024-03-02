import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buildDatasetPayload, buildStageAnnotationPayload } from 'test/unit/factories'
import { initializeARWorkflow } from 'test/unit/factories/helpers'
import { flask, scale, tag } from 'test/unit/fixtures/annotation-class-payloads'
import { LayerBar } from 'test/unit/stubs'

import ReadOnlyLayerBar from '@/components/WorkView/LayerBar/ReadOnlyLayerBar.vue'
import { Editor } from '@/engine/editor'
import { ItemManager } from '@/engine/managers'

const localVue = createLocalVue()

localVue.use(Vuex)

const item = initializeARWorkflow()
const stage = item.current_workflow!.stages[1][0]

let store: ReturnType<typeof createTestStore>
let propsData: { editor: Editor }

const stubs = { LayerBar }

let mocks: { $featureEnabled: () => boolean }

beforeEach(() => {
  store = createTestStore()

  const editor = new Editor(new ItemManager(store), store)
  const plugins = editor.pluginManager.pluginsForDataset(buildDatasetPayload(), [])
  editor.installAllPlugins(plugins)

  store.commit('workview/SET_SELECTED_DATASET_ITEM', item)
  store.commit('workview/SET_SELECTED_STAGE_INSTANCE', stage)
  store.commit('aclass/SET_CLASSES', [flask, scale, tag])

  const annotations = [
    buildStageAnnotationPayload({
      id: 'first',
      workflow_stage_id: stage.id,
      annotation_class_id: flask.id
    }),
    buildStageAnnotationPayload({
      id: 'second',
      workflow_stage_id: stage.id,
      annotation_class_id: scale.id
    })
  ]

  store.commit('workview/SET_STAGE_ANNOTATIONS', { stage, annotations })

  propsData = { editor }
  mocks = { $featureEnabled: (): boolean => false }
})

it('matches snapshot when empty', () => {
  store.commit('workview/SET_STAGE_ANNOTATIONS', { stage, annotations: [] })
  const wrapper = shallowMount(ReadOnlyLayerBar, { localVue, propsData, store, stubs, mocks })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot with annotations', () => {
  const wrapper = shallowMount(ReadOnlyLayerBar, { localVue, propsData, store, stubs, mocks })
  expect(wrapper).toMatchSnapshot()
})

it('does not render tags', () => {
  store.commit('aclass/SET_CLASSES', [tag])
  const annotations = [
    buildStageAnnotationPayload({
      id: 'tag',
      annotation_class_id: tag.id,
      workflow_stage_id: stage.id
    })
  ]
  store.commit('workview/SET_STAGE_ANNOTATIONS', { stage, annotations })
  const wrapper = shallowMount(ReadOnlyLayerBar, { localVue, propsData, store, stubs, mocks })
  expect(wrapper.findAll('layer-bar-item-stub').length).toEqual(0)
})

it('orders annotations by descending z-index', () => {
  const annotations = [
    buildStageAnnotationPayload({ id: 'first', z_index: 2, workflow_stage_id: stage.id }),
    buildStageAnnotationPayload({ id: 'second', z_index: 1, workflow_stage_id: stage.id }),
    buildStageAnnotationPayload({ id: 'third', z_index: 3, workflow_stage_id: stage.id })
  ]
  store.commit('workview/SET_STAGE_ANNOTATIONS', { stage, annotations })
  const wrapper = shallowMount(ReadOnlyLayerBar, { localVue, propsData, store, stubs, mocks })
  expect(
    wrapper.findAll('layer-bar-item-stub').wrappers.map(w => w.props('annotation').id)
  ).toEqual(['third', 'first', 'second'])
})
