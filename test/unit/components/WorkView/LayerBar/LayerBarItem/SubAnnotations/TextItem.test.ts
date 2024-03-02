import { createLocalVue, shallowMount } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import Vuex from 'vuex'

import createTestStore, { setDefaultAnnotationTypes } from 'test/unit/createTestStore'
import { stubDirectiveWithAttribute } from 'test/unit/directiveStubs'
import {
  buildAnnotationClassPayload,
  buildDatasetPayload,
  buildStageAnnotationPayload,
  buildWorkflowStagePayload
} from 'test/unit/factories'

import TextItem from '@/components/WorkView/LayerBar/LayerBarItem/SubAnnotations/TextItem.vue'
import { Editor } from '@/engine/editor'
import { ItemManager } from '@/engine/managers'
import { Text } from '@/engine/plugins/text/types'
import { StageAnnotation } from '@/store/modules/workview/types'
import { AnnotationClassPayload } from '@/store/types'

jest.mock('@/engine/actions', () => ({
  addOrUpdateSubAnnotation: jest.fn().mockImplementation(
    (editor, annotation, parent) => ({ editor, annotation, parent })
  ),
  removeSubAnnotationAction: jest.fn().mockImplementation(
    (editor, type, parent) => ({ editor, type, parent })
  )
}))

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.directive('input-auto-blur', stubDirectiveWithAttribute)

let store: ReturnType<typeof createTestStore>
let editor: Editor
let stageAnnotation: StageAnnotation
let propsData: {
  annotation: StageAnnotation
  annotationClass: AnnotationClassPayload
  data: Text
  editor: Editor
  readonly?: boolean
}

beforeEach(() => {
  store = createTestStore()
  setDefaultAnnotationTypes(store)
  const sfh = buildDatasetPayload({ id: 77 })
  const annotationClass = buildAnnotationClassPayload({
    id: 1,
    annotation_types: ['polygon', 'text'],
    datasets: [{ id: sfh.id }]
  })
  store.commit('aclass/SET_CLASSES', [annotationClass])

  const stage = buildWorkflowStagePayload({ id: 1 })
  store.commit('workview/SET_SELECTED_STAGE_INSTANCE', stage)
  const annotation = buildStageAnnotationPayload({
    annotation_class_id: annotationClass.id,
    workflow_stage_id: stage.id
  })

  store.commit('workview/SET_DATASET', sfh)
  store.commit('workview/SET_STAGE_ANNOTATIONS', { stage, annotations: [annotation] })

  editor = new Editor(new ItemManager(store), store)

  editor.installAllPlugins(editor.pluginManager.pluginsForDataset(sfh, []))

  stageAnnotation = store.state.workview.stageAnnotations[0]

  editor.activeView.setAnnotationClasses(store.state.aclass.classes)
  editor.activeView.annotationManager.setAnnotations(
    store.getters['workview/sortedAnnotationsByStage'](stage)
  )

  propsData = {
    annotation: stageAnnotation,
    annotationClass,
    data: { text: 'Text' },
    editor
  }
})

it('matches snapshot', () => {
  const wrapper = shallowMount(TextItem, { localVue, propsData, store })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when readonly', () => {
  propsData.readonly = true
  const wrapper = shallowMount(TextItem, { localVue, propsData, store })
  expect(wrapper).toMatchSnapshot()
})

it('resets data when blur', async () => {
  const wrapper = shallowMount(TextItem, { localVue, propsData, store })

  expect(wrapper.find('content-editable-stub').props('value')).toBe('Text')

  await wrapper.find('content-editable-stub').vm.$emit('input', 'New Text')
  await wrapper.find('content-editable-stub').trigger('blur')
  await wrapper.vm.$nextTick()
  expect(wrapper.find('content-editable-stub').props('value')).toBe('Text')
})

it('updates sub-annotation after pressing enter if value is not empty', async () => {
  const wrapper = shallowMount(TextItem, { localVue, propsData, store })
  jest.spyOn(editor, 'initializeSubAnnotation').mockReturnValue({ id: '111' } as any)
  jest.spyOn(editor.actionManager, 'do').mockResolvedValue(undefined)

  const comp = wrapper.vm as any
  const blurFn = jest.fn()
  jest.spyOn(comp, 'inputRef', 'get').mockReturnValue({ blur: blurFn })

  await wrapper.find('content-editable-stub').vm.$emit('input', 'New Text')
  await wrapper.find('content-editable-stub').vm.$emit('enter')

  expect(editor.initializeSubAnnotation).toBeCalledWith(
    'text',
    expect.objectContaining({ id: stageAnnotation.id }),
    { text: 'New Text' }
  )
  expect(editor.actionManager.do).toBeCalledWith({
    editor,
    annotation: expect.objectContaining({ id: '111' }),
    parent: expect.objectContaining({ id: stageAnnotation.id })
  })

  await flushPromises()
  expect(blurFn).toBeCalled()
})

it('removes sub-annotation after pressing enter if value is empty', async () => {
  const wrapper = shallowMount(TextItem, { localVue, propsData, store })
  jest.spyOn(editor.actionManager, 'do').mockResolvedValue(undefined)

  const comp = wrapper.vm as any
  const blurFn = jest.fn()
  jest.spyOn(comp, 'inputRef', 'get').mockReturnValue({ blur: blurFn })

  await wrapper.find('content-editable-stub').vm.$emit('input', '')
  await wrapper.find('content-editable-stub').vm.$emit('enter')

  expect(editor.actionManager.do).toBeCalledWith({
    editor,
    type: 'text',
    parent: expect.objectContaining({ id: stageAnnotation.id })
  })

  await flushPromises()
  expect(blurFn).toBeCalled()
})
