import { createLocalVue, shallowMount } from '@vue/test-utils'

import { buildSkeletonNodeType, buildSkeletonEdgeType } from 'test/unit/factories'

import SkeletonNode from '@/components/Classes/AnnotationClassDialog/components/SkeletonEditor/SkeletonNode.vue'
import SkeletonEditorEngine from '@/components/Classes/AnnotationClassDialog/components/SkeletonEditor/engine/SkeletonEditorEngine'
import { SkeletonNodeType } from '@/components/Classes/AnnotationClassDialog/components/SkeletonEditor/engine/types'

const localVue = createLocalVue()

let engine: SkeletonEditorEngine
let propsData: {
  engine: SkeletonEditorEngine
  node: SkeletonNodeType
}

beforeEach(() => {
  engine = new SkeletonEditorEngine(jest.fn())
  engine.setStrokeColor('#0000ff')
  propsData = {
    engine,
    node: buildSkeletonNodeType()
  }
})

it('matches snapshot', () => {
  const wrapper = shallowMount(SkeletonNode, { localVue, propsData })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when drawing', () => {
  engine.setEdges([buildSkeletonEdgeType({ isDrawing: true })])
  const wrapper = shallowMount(SkeletonNode, { localVue, propsData })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when node is highlighted', () => {
  propsData.node = buildSkeletonNodeType({ isHighlighted: true })
  const wrapper = shallowMount(SkeletonNode, { localVue, propsData })
  expect(wrapper).toMatchSnapshot()
})

it('should emit change when change is detected', async () => {
  const wrapper = shallowMount(SkeletonNode, { localVue, propsData })
  await wrapper.find('skeleton-node-overlay-stub').vm.$emit('change')
  expect(wrapper.emitted().change).toEqual([[propsData.node]])
})
