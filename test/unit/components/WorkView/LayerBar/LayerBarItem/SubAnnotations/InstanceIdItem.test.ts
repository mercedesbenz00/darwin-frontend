import { createLocalVue, shallowMount } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { stubDirectiveWithAttribute } from 'test/unit/directiveStubs'
import {
  buildAnnotationClassPayload,
  buildStageAnnotation
} from 'test/unit/factories'

import InstanceIdItem from '@/components/WorkView/LayerBar/LayerBarItem/SubAnnotations/InstanceIdItem.vue'
import { Editor } from '@/engine/editor'
import { ItemManager } from '@/engine/managers'
import { InstanceID } from '@/engine/plugins/instanceId/types'
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
  data: InstanceID
  editor: Editor
  readonly?: boolean
}

beforeEach(() => {
  store = createTestStore()
  const annotationClass = buildAnnotationClassPayload({ id: 1 })
  editor = new Editor(new ItemManager(store), store)
  stageAnnotation = buildStageAnnotation({ annotation_class_id: 1, id: '1' })
  jest.spyOn(editor.activeView.annotationManager, 'annotations', 'get')
    .mockReturnValue([
      {
        id: stageAnnotation.id,
        subAnnotations: [{ type: 'instance_id' }]
      } as any
    ])

  propsData = {
    annotation: stageAnnotation,
    annotationClass,
    data: { value: 100 },
    editor
  }
})

it('matches snapshot', () => {
  const wrapper = shallowMount(InstanceIdItem, { localVue, propsData, store })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when readonly', () => {
  propsData.readonly = true
  const wrapper = shallowMount(InstanceIdItem, { localVue, propsData, store })
  expect(wrapper).toMatchSnapshot()
})

it('resets data when blur', async () => {
  const wrapper = shallowMount(InstanceIdItem, { localVue, propsData, store })

  expect(wrapper.find('content-editable-stub').props('value')).toBe('100')

  await wrapper.find('content-editable-stub').vm.$emit('input', '200')
  await wrapper.find('content-editable-stub').trigger('blur')
  await wrapper.vm.$nextTick()
  expect(wrapper.find('content-editable-stub').props('value')).toBe('100')
})

it('only accepts numbers', async () => {
  const wrapper = shallowMount(InstanceIdItem, { localVue, propsData, store })
  await wrapper.find('content-editable-stub').element.dispatchEvent(new KeyboardEvent('keypress', { keyCode: 47 }))
  expect(store.dispatch).toBeCalledWith('toast/notify', { content: expect.stringContaining('numbers') })
})

it('updates sub-annotation after pressing enter if value is not empty', async () => {
  const wrapper = shallowMount(InstanceIdItem, { localVue, propsData, store })
  jest.spyOn(editor, 'initializeSubAnnotation').mockReturnValue({ id: '111' } as any)
  jest.spyOn(editor.actionManager, 'do').mockResolvedValue(undefined)

  const comp = wrapper.vm as any
  const blurFn = jest.fn()
  jest.spyOn(comp, 'inputRef', 'get').mockReturnValue({ blur: blurFn })

  await wrapper.find('content-editable-stub').vm.$emit('input', '200')
  await wrapper.find('content-editable-stub').vm.$emit('enter')

  expect(editor.initializeSubAnnotation).toBeCalledWith(
    'instance_id',
    expect.objectContaining({ id: stageAnnotation.id }),
    { value: 200 }
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
  const wrapper = shallowMount(InstanceIdItem, { localVue, propsData, store })
  jest.spyOn(editor.actionManager, 'do').mockResolvedValue(undefined)

  const comp = wrapper.vm as any
  const blurFn = jest.fn()
  jest.spyOn(comp, 'inputRef', 'get').mockReturnValue({ blur: blurFn })

  await wrapper.find('content-editable-stub').vm.$emit('input', '')
  await wrapper.find('content-editable-stub').vm.$emit('enter')

  expect(editor.actionManager.do).toBeCalledWith({
    editor,
    type: 'instance_id',
    parent: expect.objectContaining({ id: stageAnnotation.id })
  })

  await flushPromises()
  expect(blurFn).toBeCalled()
})
