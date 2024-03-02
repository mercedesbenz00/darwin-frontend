import { createLocalVue, shallowMount, Stubs } from '@vue/test-utils'

import { buildSkeletonNodeType } from 'test/unit/factories'
import { VPopover } from 'test/unit/stubs'

import SkeletonNodeOverlay from '@/components/Classes/AnnotationClassDialog/components/SkeletonEditor/SkeletonNodeOverlay.vue'
import SkeletonEditorEngine from '@/components/Classes/AnnotationClassDialog/components/SkeletonEditor/engine/SkeletonEditorEngine'
import { SkeletonNodeType } from '@/components/Classes/AnnotationClassDialog/components/SkeletonEditor/engine/types'

const localVue = createLocalVue()

const stubs: Stubs = { VPopover }
let engine: SkeletonEditorEngine
let propsData: {
  engine: SkeletonEditorEngine
  node: SkeletonNodeType
}

beforeEach(() => {
  engine = new SkeletonEditorEngine(jest.fn())
  engine.setStrokeColor('#00ff00')
  engine.setMovingNode = jest.fn()
  engine.startDrawingEdgeFromNode = jest.fn()
  engine.removeNode = jest.fn()

  propsData = {
    engine,
    node: buildSkeletonNodeType()
  }
})

it('matches snapshot', () => {
  const wrapper = shallowMount(SkeletonNodeOverlay, { localVue, propsData, stubs })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when engine is editing', () => {
  engine.setEditing(true)
  const wrapper = shallowMount(SkeletonNodeOverlay, { localVue, propsData, stubs })
  expect(wrapper).toMatchSnapshot()
})

it('start moving a node when you click on the move icon', () => {
  const wrapper = shallowMount(SkeletonNodeOverlay, { localVue, propsData, stubs })
  wrapper.findAll('.skeleton-node-overlay__item').at(0).trigger('mousedown')
  expect(engine.setMovingNode).toBeCalledWith(propsData.node)
})

it('start creating a new edge when you click on the link icon', () => {
  const wrapper = shallowMount(SkeletonNodeOverlay, { localVue, propsData, stubs })
  wrapper.findAll('.skeleton-node-overlay__item').at(1).trigger('click')
  expect(engine.startDrawingEdgeFromNode).toBeCalledWith(propsData.node)
})

it('set focus and select all the text in node id input when it appears', () => {
  const wrapper = shallowMount(SkeletonNodeOverlay, { localVue, propsData, stubs })

  const vm = wrapper.vm as any
  vm.$refs.nodeIdInput = {
    reset: jest.fn()
  }

  vm.onPopoverShow()
  expect(vm.$refs.nodeIdInput.reset).toBeCalled()
})

it('remove an existing edge when you click on the trash icon', async () => {
  const wrapper = shallowMount(SkeletonNodeOverlay, { localVue, propsData, stubs })
  await wrapper.findAll('.skeleton-node-overlay__item').at(3).trigger('click')
  expect(engine.removeNode).toBeCalledWith(propsData.node)
})

it('should emit change when id is saved', async () => {
  const wrapper = shallowMount(SkeletonNodeOverlay, { localVue, propsData, stubs })
  await wrapper.find('skeleton-node-id-input-stub').vm.$emit('saved')
  expect(wrapper.emitted().change).toEqual([[propsData.node]])
})
