import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buildBoundingBoxVideoAnnotation } from 'test/unit/factories'

import ContextMenu from '@/components/WorkView/VideoScrubber/ContextMenu.vue'
import { Editor } from '@/engine/editor'
import { ItemManager } from '@/engine/managers'
import { Annotation } from '@/engine/models'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.directive('click-outside', () => {})

let store: ReturnType<typeof createTestStore>
let editor: Editor
let propsData: {
  annotation?: Annotation
  editor: Editor
  x: number
  y: number
  offsetX: number
  visible: boolean
  keyframeToDelete: number | null
}

beforeEach(() => {
  store = createTestStore()
  editor = new Editor(new ItemManager(store), store)
  propsData = {
    annotation: buildBoundingBoxVideoAnnotation(editor)!,
    editor,
    x: 0,
    y: 0,
    offsetX: 0,
    visible: true,
    keyframeToDelete: null
  }
})

it('matches snapshot when visible', () => {
  const wrapper = shallowMount(ContextMenu, { localVue, propsData, store })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when invisible', () => {
  propsData.visible = false
  const wrapper = shallowMount(ContextMenu, { localVue, propsData, store })

  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when delete key frame is set', () => {
  propsData.keyframeToDelete = 3
  const wrapper = shallowMount(ContextMenu, { localVue, propsData, store })

  expect(wrapper).toMatchSnapshot()
})

it('creates keyframe', async () => {
  const wrapper = shallowMount(ContextMenu, { localVue, propsData, store })
  const component = wrapper.vm as any
  component.onCreateKeyFrame = jest.fn()
  await wrapper.findAll('popup-menu-item-stub').at(0).trigger('click')
  expect(component.onCreateKeyFrame).toHaveBeenCalled()
})

it('creates keyframe with calculated frameIndex', () => {
  propsData.offsetX = 40
  const wrapper = shallowMount(ContextMenu, { localVue, propsData, store })
  jest.spyOn(editor.activeView, 'createKeyFrame').mockReturnValue(undefined)
  const component = wrapper.vm as any
  component.onCreateKeyFrame()
  expect(editor.activeView.createKeyFrame).toBeCalledWith(propsData.annotation, 10)
})

it('deletes keyframe', async () => {
  propsData.keyframeToDelete = 3
  const wrapper = shallowMount(ContextMenu, { localVue, propsData, store })
  const component = wrapper.vm as any
  component.onDeleteKeyFrame = jest.fn()
  await wrapper.findAll('popup-menu-item-stub').at(1).trigger('click')
  expect(component.onDeleteKeyFrame).toHaveBeenCalled()
})

it('changes annotation class', async () => {
  const wrapper = shallowMount(ContextMenu, { localVue, propsData, store })
  const component = wrapper.vm as any
  component.onChangeClass = jest.fn()
  await wrapper.findAll('popup-menu-item-stub').at(1).trigger('click')
  expect(component.onChangeClass).toHaveBeenCalled()
})

it('deletes annotation', async () => {
  const wrapper = shallowMount(ContextMenu, { localVue, propsData, store })
  const component = wrapper.vm as any
  component.onDeleteAnnotation = jest.fn()
  await wrapper.findAll('popup-menu-item-stub').at(2).trigger('click')
  expect(component.onDeleteAnnotation).toHaveBeenCalled()
})
