import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import {
  buildAnnotationClassPayload,
  buildAttributePayload,
  buildStageAnnotation
} from 'test/unit/factories'

import AttributesItem from '@/components/WorkView/LayerBar/LayerBarItem/SubAnnotations/AttributesItem.vue'
import { Editor } from '@/engine/editor'
import { ItemManager } from '@/engine/managers'
import { Attributes } from '@/engine/plugins/attributes/types'
import { StageAnnotation } from '@/store/modules/workview/types'
import { AnnotationClassPayload, AttributePayload } from '@/store/types'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>
let attributes: AttributePayload[]
let editor: Editor
let stageAnnotation: StageAnnotation
let propsData: {
  annotation: StageAnnotation
  annotationClass: AnnotationClassPayload
  data: Attributes
  editor: Editor
  readonly?: boolean
}
const stubs = { 'v-popover': true }

beforeEach(() => {
  store = createTestStore()
  const annotationClass = buildAnnotationClassPayload({ id: 1 })
  attributes = [
    buildAttributePayload({
      id: '1',
      class_id: annotationClass.id,
      color: 'rgba(0,0,0,0.1)',
      name: 'attribute1'
    }),
    buildAttributePayload({
      id: '2',
      class_id: annotationClass.id,
      color: 'rgba(0,0,0,0.1)',
      name: 'attribute2'
    }),
    buildAttributePayload({
      id: '3',
      class_id: annotationClass.id,
      color: 'rgba(0,0,0,0.1)',
      name: 'attribute3'
    })
  ]
  editor = new Editor(new ItemManager(store), store)
  stageAnnotation = buildStageAnnotation({ annotation_class_id: 1, id: '1' })
  store.commit('aclass/ADD_ANNOTATION_ATTRIBUTE', attributes[0])
  store.commit('aclass/ADD_ANNOTATION_ATTRIBUTE', attributes[1])
  store.commit('aclass/ADD_ANNOTATION_ATTRIBUTE', attributes[2])
  jest.spyOn(editor.activeView.annotationManager, 'annotations', 'get')
    .mockReturnValue([
      { id: stageAnnotation.id } as any
    ])
  propsData = {
    annotation: stageAnnotation,
    annotationClass,
    data: { attributes: ['1', '2'] },
    editor
  }
})

it('matches snapshot', () => {
  const wrapper = shallowMount(AttributesItem, { localVue, propsData, store, stubs })
  expect(wrapper).toMatchSnapshot()
  expect(wrapper.findAll('.attributes-item__attribute')).toHaveLength(2)
})

it('matches snapshot when readonly', () => {
  propsData.readonly = true
  const wrapper = shallowMount(AttributesItem, { localVue, propsData, store, stubs })
  expect(wrapper).toMatchSnapshot()
  expect(wrapper.findAll('.attributes-item__attribute')).toHaveLength(2)
})

it('matches snapshot when empty', () => {
  propsData.data.attributes = []
  const wrapper = shallowMount(AttributesItem, { localVue, propsData, store, stubs })
  expect(wrapper).toMatchSnapshot()
})

it('activates attributes tool', async () => {
  const wrapper = shallowMount(AttributesItem, { localVue, propsData, store, stubs })
  jest.spyOn(editor, 'activateTool').mockReturnValue(undefined)
  await wrapper.find('sub-annotation-item-stub')!.vm.$emit('click')
  expect(editor.activateTool).toBeCalledWith(
    'attributes_tool',
    { sub: { master: expect.objectContaining({ id: '1' }) } }
  )
})

it('on click should trigger AttributesInput components focus for tag type attribute', async () => {
  jest.spyOn(editor.activeView.annotationManager, 'annotations', 'get')
    .mockReturnValue([
      { id: stageAnnotation.id, type: 'tag' } as any
    ])

  const wrapper = shallowMount(AttributesItem, { localVue, propsData, store, stubs })

  const vm = wrapper.vm as any
  vm.$refs.input = {
    setInputFocus: jest.fn()
  }

  await wrapper.find('sub-annotation-item-stub')!.vm.$emit('click')
  expect(vm.$refs.input.setInputFocus).toHaveBeenCalled()
})
