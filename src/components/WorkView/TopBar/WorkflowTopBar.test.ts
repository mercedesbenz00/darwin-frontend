import { createLocalVue, shallowMount, Stubs } from '@vue/test-utils'
import VModal from 'vue-js-modal'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { stubDirectiveWithAttribute } from 'test/unit/directiveStubs'
import {
  buildDatasetImagePayload,
  buildDatasetItemPayload,
  buildDatasetPayload,
  buildImagePayload,
  buildModelPayload,
  buildTeamPayload
} from 'test/unit/factories'
import { TopBar, VPopover } from 'test/unit/stubs'

import { Editor } from '@/engine/editor'
import { ItemManager } from '@/engine/managers'
import { ModelPayload } from '@/store/modules/neuralModel/types'
import { DatasetItemPayload } from '@/store/types'
import { ModelType } from '@/utils/wind/types'

import WorkflowTopBar from './WorkflowTopBar.vue'

const localVue = createLocalVue()

localVue.use(VModal)
localVue.use(Vuex)
localVue.directive('tooltip', stubDirectiveWithAttribute)

const stubs: Stubs = {
  TopBar,
  VPopover,
  'router-link': true,
  'work-tracker': true
}

const v7 = buildTeamPayload({
  id: 1,
  name: 'V7',
  image: buildImagePayload({ id: 1, url: 'team_logo' })
})

let store: ReturnType<typeof createTestStore>

let propsData: {
  editor: Editor
}

jest.mock('@/engineV2/workers/FramesLoaderWorker')

beforeEach(() => {
  store = createTestStore()
  propsData = {
    editor: new Editor(new ItemManager(store), store)
  }
  jest.spyOn(propsData.editor.camera, 'setImage').mockImplementation(jest.fn)
})

const sfhDataset = buildDatasetPayload({ id: 5, name: 'SFH', slug: 'sfh', num_images: 20 })
let item: DatasetItemPayload

const mocks = {
  $featureEnabled: (): boolean => false
}

beforeEach(() => {
  store.commit('team/SET_CURRENT_TEAM', v7)
  store.commit('workview/SET_DATASET', sfhDataset)
  item = buildDatasetItemPayload({ id: 1, dataset_id: 5 })
})

it('matches snapshot', () => {
  const wrapper = shallowMount(WorkflowTopBar, { localVue, mocks, propsData, store, stubs })
  expect(wrapper).toMatchSnapshot()
})

describe('with selected item', () => {
  beforeEach(() => {
    store.commit('workview/SET_SELECTED_DATASET_ITEM', item)
  })

  it('matches snapshot', () => {
    const wrapper = shallowMount(WorkflowTopBar, { localVue, mocks, propsData, store, stubs })
    expect(wrapper).toMatchSnapshot()
  })

  it('renders workflow-controls', () => {
    const wrapper = shallowMount(WorkflowTopBar, { localVue, mocks, propsData, store, stubs })
    expect(wrapper.find('workflow-controls-stub').exists()).toBe(true)
  })

  it('renders action history', () => {
    const wrapper = shallowMount(WorkflowTopBar, { localVue, mocks, propsData, store, stubs })
    expect(wrapper.find('action-history-trigger-stub').exists()).toBe(true)
  })
})

it("matches snapshot when selected item's image is in external storage", () => {
  item.dataset_image = buildDatasetImagePayload({ image: buildImagePayload({ external: true }) })
  store.commit('workview/SET_SELECTED_DATASET_ITEM', item)
  const wrapper = shallowMount(WorkflowTopBar, { localVue, mocks, propsData, store, stubs })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when selected item is in dicom', () => {
  const mockEditor = {
    activeView: {
      isDicomItem: true,
      isPdfItem: false
    },
    actionManager: { canRedo: false, canUndo: false }
  }
  const propsData = { editor: mockEditor }
  const wrapper = shallowMount(WorkflowTopBar, { localVue, mocks, propsData, store, stubs })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when selected item is in pdf', () => {
  const mockEditor = {
    activeView: {
      isDicomItem: false,
      isPdfItem: true
    },
    actionManager: { canRedo: false, canUndo: false }
  }
  const propsData = { editor: mockEditor }
  const wrapper = shallowMount(WorkflowTopBar, { localVue, mocks, propsData, store, stubs })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot with available models', () => {
  const models: ModelPayload[] = [
    buildModelPayload({
      id: 'model-1',
      team_id: v7.id,
      name: 'Model 1',
      status: [{ status: 'available', mode: '', latest_updated_at: new Date() }],
      type: ModelType.AutoAnnotation,
      tier: 'standard',
      url: 'example.com'
    })
  ]
  store.commit('workview/SET_CURRENT_TOOL', 'clicker_tool')
  store.commit('workview/SET_AUTO_ANNOTATE_MODELS', models)
  const wrapper = shallowMount(WorkflowTopBar, { localVue, mocks, propsData, store, stubs })
  expect(wrapper).toMatchSnapshot()
})

it('emits add class from class selection dropdown', () => {
  const wrapper = shallowMount(WorkflowTopBar, { localVue, mocks, propsData, store, stubs })
  wrapper.find('tool-class-selection-stub').vm.$emit('add-class')
  expect(wrapper.emitted()['add-class']).toBeDefined()
})
