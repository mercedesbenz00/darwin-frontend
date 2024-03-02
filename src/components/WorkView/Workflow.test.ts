import { createLocalVue, shallowMount, Stubs, Wrapper } from '@vue/test-utils'
import Vue, { ref } from 'vue'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import {
  buildDatasetPayload,
  buildLoadedFrame,
  buildLoadedVideo,
  buildWorkflowStagePayload
} from 'test/unit/factories'
import { Workview } from 'test/unit/stubs'

import Workflow from '@/components/WorkView/Workflow.vue'
import { connectStore } from '@/engine/connectStore'
import { Editor } from '@/engine/editor'
import { ItemManager } from '@/engine/managers'
import Abilities from '@/plugins/abilities'
import { StageType } from '@/store/types'

let localVue: ReturnType<typeof createLocalVue>
let store: ReturnType<typeof createTestStore>
let stubs: Stubs
let wrapper: Wrapper<Vue>

let editor: Editor

jest.mock('@/engineV2/workers/FramesLoaderWorker')
jest.mock('@/engine/connectStore', () => ({ connectStore: jest.fn() }))

beforeEach(() => {
  localVue = createLocalVue()
  localVue.use(Vuex)
  store = createTestStore()
  localVue.use(Abilities, store)
  stubs = { Workview }

  editor = new Editor(new ItemManager(store), store)

  wrapper = shallowMount(Workflow, {
    localVue,
    store,
    stubs,
    provide: () => ({
      editor: ref(editor)
    })
  })
})

jest.mock('@/engineV2/workers/FramesLoaderWorker')

it('should trigger editor.init on creation', () => {
  jest.spyOn(Editor.prototype, 'init')

  const editor = new Editor(new ItemManager(store), store)

  shallowMount(Workflow, {
    localVue,
    store,
    stubs,
    provide: () => ({
      editor: ref(editor)
    })
  })

  expect(editor.init).toHaveBeenCalledTimes(1)
})

it('should connect the store on creation', () => {
  expect(connectStore).toHaveBeenCalled()
})

it('matches snapshot', () => {
  expect(wrapper).toMatchSnapshot()
})

it('renders stage overlay', () => {
  expect(wrapper.find('stage-overlay-stub').exists()).toBe(true)
})

it('shows class dialog when add-class is triggered from top bar', async () => {
  const ref = wrapper.vm.$refs.workview as unknown as { showClassDialog: () => unknown }
  const spy = jest.spyOn(ref, 'showClassDialog')
  wrapper.find('workflow-top-bar-stub').vm.$emit('add-class')
  await wrapper.vm.$nextTick()
  expect(spy).toHaveBeenCalled()
})

it('renders all expected renderless components', () => {
  expect(wrapper.find('items-loader-stub').exists()).toBe(true)
  expect(wrapper.find('default-workflow-loader-stub').exists()).toBe(true)
  expect(wrapper.find('item-count-loader-stub').exists()).toBe(true)
  expect(wrapper.find('models-loader-stub').exists()).toBe(true)
  expect(wrapper.find('stage-annotation-loader-stub').exists()).toBe(true)
  expect(wrapper.find('stage-selector-stub').exists()).toBe(true)
  expect(wrapper.find('comment-loader-stub').exists()).toBe(true)
  expect(wrapper.find('workflow-instructions-trigger-stub').exists()).toBe(true)
  expect(wrapper.find('workflow-plugin-manager-stub').exists()).toBe(true)
})

it('renders video annotations control', async () => {
  editor.loadedVideo = buildLoadedVideo({
    frames: {
      0: buildLoadedFrame({ seq: 1 }),
      1: buildLoadedFrame({ seq: 2 })
    }
  })
  await wrapper.vm.$nextTick()
  expect(wrapper).toMatchSnapshot()
  expect(wrapper.find('video-annotations-stub').exists()).toBeTruthy()
})

it('never render video annotations control when dicom video has 1 frame', async () => {
  const comp = wrapper.vm as any
  jest.spyOn(comp.editor.activeView, 'isDicomItem', 'get').mockReturnValue(true)
  comp.editor.loadedVideo = buildLoadedVideo({
    frames: { 0: buildLoadedFrame({ seq: 1 }) }
  })
  await wrapper.vm.$nextTick()
  expect(wrapper).toMatchSnapshot()
  expect(wrapper.find('video-annotations-stub').exists()).toBeFalsy()
})

it('never render video annotations control when pdf video has 1 frame', async () => {
  const comp = wrapper.vm as any
  jest.spyOn(comp.editor.activeView, 'isPdfItem', 'get').mockReturnValue(true)
  comp.editor.loadedVideo = buildLoadedVideo({
    frames: { 0: buildLoadedFrame({ seq: 1 }) }
  })
  await wrapper.vm.$nextTick()
  expect(wrapper).toMatchSnapshot()
  expect(wrapper.find('video-annotations-stub').exists()).toBeFalsy()
})

it('loads the Workflows V1 version of the annotation loader', () => {
  expect(wrapper.find('v2-stage-annotation-loader-stub').exists()).toBeFalsy()
  expect(wrapper.find('stage-annotation-loader-stub').exists()).toBeTruthy()
})

describe('Tag Applier behavior', () => {
  beforeEach(() => {
    store.commit('workview/SET_DATASET', buildDatasetPayload())
    store.commit(
      'workview/SET_SELECTED_STAGE_INSTANCE',
      buildWorkflowStagePayload({ type: StageType.Complete })
    )
  })

  it('disables TagApplier in completed stage', () => {
    expect(wrapper).toMatchSnapshot()
    expect(wrapper.find('tag-applier-stub').props('disabled')).toBe(true)
  })
})
