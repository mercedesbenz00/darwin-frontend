import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'

import { createTestStore, setDefaultAnnotationTypes } from 'test/unit/createTestStore'
import { stubDirectiveWithAttribute } from 'test/unit/directiveStubs'
import { buildStageAnnotationPayload, buildWorkflowStagePayload } from 'test/unit/factories'
import { flask, scale, bottle } from 'test/unit/fixtures/annotation-class-payloads'

import LayerBarItem from '@/components/WorkView/LayerBar/LayerBarItem/LayerBarItem.vue'
import { Editor } from '@/engine/editor'
import { ItemManager } from '@/engine/managers'
import { StageAnnotation } from '@/store/modules/workview/types'
import { AnnotationClassPayload } from '@/store/types'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.directive('tooltip', stubDirectiveWithAttribute)

let store: ReturnType<typeof createTestStore>
let annotation: StageAnnotation

let propsData: {
  annotation: StageAnnotation
  annotationClass: AnnotationClassPayload
  annotations: StageAnnotation[]
  editor: Editor
  readonly?: boolean
}

beforeEach(() => {
  store = createTestStore()
  setDefaultAnnotationTypes(store)

  const stage = buildWorkflowStagePayload({ id: 1 })
  const payload = buildStageAnnotationPayload({
    annotation_class_id: bottle.id,
    workflow_stage_id: 1
  })

  store.commit('workview/SET_STAGE_ANNOTATIONS', { stage, annotations: [payload] })
  annotation = store.state.workview.stageAnnotations[0]

  const editor = new Editor(new ItemManager(store), store)
  propsData = {
    annotation,
    annotationClass: bottle,
    annotations: store.state.workview.stageAnnotations,
    editor
  }
})

it('matches snapshot when visible', () => {
  const wrapper = shallowMount(LayerBarItem, { localVue, propsData, store })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when readonly', () => {
  propsData.readonly = true
  const wrapper = shallowMount(LayerBarItem, { localVue, propsData, store })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when invisible', () => {
  store.commit('workview/HIDE_ANNOTATION', annotation.id)
  const wrapper = shallowMount(LayerBarItem, { localVue, propsData, store })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when highlighted', () => {
  store.commit('workview/HIGHLIGHT_ANNOTATION', annotation.id)
  const wrapper = shallowMount(LayerBarItem, { localVue, propsData, store })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when selected', () => {
  store.commit('workview/TOGGLE_ANNOTATION_SELECTION', annotation)
  const wrapper = shallowMount(LayerBarItem, { localVue, propsData, store })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when different class', () => {
  store.commit('workview/UPDATE_STAGE_ANNOTATION', {
    annotation,
    data: { annotation_class_id: flask.id }
  })
  const wrapper = shallowMount(LayerBarItem, { localVue, propsData, store })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when unknown class', () => {
  store.commit('workview/UPDATE_STAGE_ANNOTATION', {
    annotation,
    data: { annotation_class_id: scale.id }
  })
  const wrapper = shallowMount(LayerBarItem, { localVue, propsData, store })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when given slot', () => {
  const slots = {
    default: '<div class="fake-action">Click Me</div>'
  }
  const wrapper = shallowMount(LayerBarItem, { localVue, propsData, slots, store })
  expect(wrapper).toMatchSnapshot()
})

it('highlights on mouseenter, unhighlights on mouseout', async () => {
  const wrapper = shallowMount(LayerBarItem, { localVue, propsData, store })
  expect(wrapper.find('.layerbar-item--highlighted').exists()).toBe(false)
  expect(annotation.isHighlighted).toBe(false)

  await wrapper.find('.layerbar-item').trigger('mouseenter')
  await wrapper.vm.$nextTick()
  expect(annotation.isHighlighted).toBe(true)
  expect(wrapper.find('.layerbar-item--highlighted').exists()).toBe(true)

  await wrapper.find('.layerbar-item').trigger('mouseleave')
  await wrapper.vm.$nextTick()
  expect(annotation.isHighlighted).toBe(false)
  expect(wrapper.find('.layerbar-item--highlighted').exists()).toBe(false)
})

it('triggers select event', async () => {
  HTMLElement.prototype.scrollIntoView = jest.fn()
  const wrapper = shallowMount(LayerBarItem, { localVue, propsData, store })

  jest.spyOn(store, 'commit')
  await wrapper.find('.layerbar-item__content').trigger('click')
  expect(store.commit).toHaveBeenCalledWith('workview/TOGGLE_ANNOTATION_SELECTION', annotation)
})

// document.createElement returns a DOMRect, which we can't instantiate in JSDOM,
// so we have to build a fake one
const buildRect = (x: number, y: number, width: number, height: number): DOMRect => ({
  x,
  y,
  left: x,
  right: x + width,
  top: y,
  bottom: y + height,
  width,
  height,
  toJSON: (): string => ''
})

const fakeQuerySelector = (selector: string): HTMLDivElement | null => {
  if (selector === '.layerbar__header') {
    const el = document.createElement('div')
    // header is vertically from 0 to 200 px
    el.getBoundingClientRect = (): DOMRect => buildRect(0, 0, 0, 200)
    return el
  }
  if (selector === '.workview__center__layerbar') {
    const el = document.createElement('div')
    // footer is vertically from 1000 to 1000 px
    el.getBoundingClientRect = (): DOMRect => buildRect(0, 1000, 0, 100)
    return el
  }

  return null
}

it('triggers scroll to item when selection change in the middle', async () => {
  const mockScrollFn = jest.fn()
  HTMLElement.prototype.scrollIntoView = mockScrollFn
  const wrapper = shallowMount(LayerBarItem, { localVue, propsData, store })
  jest.spyOn(wrapper.element, 'getBoundingClientRect').mockReturnValue(buildRect(0, 500, 0, 100))
  jest.spyOn(document, 'querySelector').mockImplementation(fakeQuerySelector)

  store.commit('workview/TOGGLE_ANNOTATION_SELECTION', annotation)
  await wrapper.vm.$nextTick()
  expect(mockScrollFn).toHaveBeenCalledTimes(0)
})

it('triggers modify on double-click', async () => {
  const wrapper = shallowMount(LayerBarItem, { localVue, propsData, store })
  await wrapper.find('.layerbar-item').trigger('dblclick')
  expect(wrapper.emitted().modify).toHaveLength(1)
})

it('triggers remove on button click', async () => {
  const wrapper = shallowMount(LayerBarItem, { localVue, propsData, store })
  await wrapper.find('trash-button-stub').vm.$emit('click')
  expect(wrapper.emitted().remove).toHaveLength(1)
})

it('with confidence score', () => {
  const stage = buildWorkflowStagePayload({ id: 1 })
  const payload = buildStageAnnotationPayload({
    annotation_class_id: bottle.id,
    data: {
      inference: {
        confidence: 0.5,
        model: {
          id: 'fake-model',
          name: 'Fake Model',
          type: 'instance_segmentation'
        }
      }
    },
    workflow_stage_id: 1
  })

  store.commit('workview/SET_STAGE_ANNOTATIONS', { stage, annotations: [payload] })
  annotation = store.state.workview.stageAnnotations[0]

  const editor = new Editor(new ItemManager(store), store)
  propsData = {
    annotation,
    annotationClass: bottle,
    annotations: store.state.workview.stageAnnotations,
    editor
  }

  const wrapper = shallowMount(LayerBarItem, { localVue, propsData, store })
  expect(wrapper).toMatchSnapshot()
})
