import { createLocalVue, shallowMount } from '@vue/test-utils'
import VModal from 'vue-js-modal'
import VueLazyload from 'vue-lazyload'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import {
  buildDatasetPayload,
  buildLoadedFrame,
  buildLoadedVideo
} from 'test/unit/factories'
import { flask, bottle, scale } from 'test/unit/fixtures/annotation-class-payloads'
import { Workview, TopBar } from 'test/unit/stubs'

import { Editor } from '@/engine/editor'
import { ItemManager } from '@/engine/managers'
import DatasetImageView from '@/views/open-datasets/DatasetImageView.vue'

const localVue = createLocalVue()
let mocks: { $featureEnabled: () => boolean }

localVue.prototype.$ga = { event (): void { } }

localVue.use(Vuex)
localVue.use(VModal)
localVue.use(VueLazyload)

const sfhDataset = buildDatasetPayload({
  id: 1,
  team_id: 11,
  slug: 'sfh',
  team_slug: 'sfh_team'
})

const birdsDataset = buildDatasetPayload({
  id: 2,
  slug: 'birds',
  team_slug: 'birds_team',
  team_id: 22
})

const stubs = { Workview, TopBar }

let store: ReturnType<typeof createTestStore>
let editor: Editor

beforeEach(() => {
  store = createTestStore()
  store.commit('dataset/SET_DATASETS', [sfhDataset, birdsDataset])
  store.commit('workview/SET_DATASET', sfhDataset)
  store.commit('aclass/SET_CLASSES', [flask, bottle, scale])

  mocks = { $featureEnabled: (): boolean => false }

  editor = new Editor(new ItemManager(store), store)
})

it('matches snapshot', () => {
  const wrapper = shallowMount(DatasetImageView, {
    localVue,
    store,
    stubs,
    mocks,
    provide () {
      return {
        editor: { value: editor }
      }
    }
  })

  expect(wrapper).toMatchSnapshot()
})

it('renders all expected renderless components', () => {
  const wrapper = shallowMount(DatasetImageView, {
    localVue,
    store,
    stubs,
    mocks,
    provide () {
      return {
        editor: { value: editor }
      }
    }
  })

  expect(wrapper.find('items-loader-stub').exists()).toBe(true)
  expect(wrapper.find('item-count-loader-stub').exists()).toBe(true)
  expect(wrapper.find('stage-annotation-loader-stub').exists()).toBe(true)
  expect(wrapper.find('stage-selector-stub').exists()).toBe(true)
})

it('renders video annotations control', async () => {
  editor.loadedVideo = buildLoadedVideo({
    frames: {
      0: buildLoadedFrame({ seq: 1 }),
      1: buildLoadedFrame({ seq: 2 })
    }
  })
  
  const wrapper = shallowMount(DatasetImageView, {
    localVue,
    store,
    stubs,
    mocks,
    provide: { editor: { value: editor } }
  })
  await wrapper.vm.$nextTick()
  expect(wrapper).toMatchSnapshot()
  expect(wrapper.find('video-annotations-stub').exists()).toBeTruthy()
})

it('never render video annotations control when dicom video has 1 frame', async () => {
  const wrapper = shallowMount(DatasetImageView, {
    localVue,
    store,
    stubs,
    mocks,
    provide () {
      return {
        editor: { value: editor }
      }
    }
  })
  const comp = wrapper.vm as any
  jest.spyOn(comp.editor.value.activeView, 'isDicomItem', 'get').mockReturnValue(true)
  comp.editor.value.loadedVideo = buildLoadedVideo({
    frames: { 0: buildLoadedFrame({ seq: 1 }) }
  })
  await wrapper.vm.$nextTick()
  expect(wrapper).toMatchSnapshot()
  expect(wrapper.find('video-annotations-stub').exists()).toBeFalsy()
})

it('never render video annotations control when pdf video has 1 frame', async () => {
  const wrapper = shallowMount(DatasetImageView, {
    localVue,
    store,
    stubs,
    mocks,
    provide () {
      return {
        editor: { value: editor }
      }
    }
  })
  const comp = wrapper.vm as any
  jest.spyOn(comp.editor.value.activeView, 'isPdfItem', 'get').mockReturnValue(true)
  comp.editor.value.loadedVideo = buildLoadedVideo({
    frames: { 0: buildLoadedFrame({ seq: 1 }) }
  })
  await wrapper.vm.$nextTick()
  expect(wrapper).toMatchSnapshot()
  expect(wrapper.find('video-annotations-stub').exists()).toBeFalsy()
})

it('loads the Workflows V1 version of the annotation loader', () => {
  const wrapper = shallowMount(DatasetImageView, {
    localVue,
    store,
    stubs,
    mocks,
    provide () {
      return {
        editor: { value: editor }
      }
    }
  })
  expect(wrapper.find('v2-stage-annotation-loader-stub').exists()).toBeFalsy()
  expect(wrapper.find('stage-annotation-loader-stub').exists()).toBeTruthy()
})
