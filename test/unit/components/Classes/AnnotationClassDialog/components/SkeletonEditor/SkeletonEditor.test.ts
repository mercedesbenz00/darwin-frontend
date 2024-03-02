import { createLocalVue, shallowMount } from '@vue/test-utils'

import { createMockTheme } from 'test/unit/components/mocks'

import SkeletonEditor from '@/components/Classes/AnnotationClassDialog/components/SkeletonEditor/SkeletonEditor.vue'
import { SkeletonMetadata } from '@/store/types'

const localVue = createLocalVue()

const mocks = {
  $theme: createMockTheme()
}
let propsData: {
  editing: boolean
  skeleton: SkeletonMetadata
  strokeColor: string
  error?: string
}

beforeEach(() => {
  propsData = {
    editing: false,
    skeleton: { nodes: [], edges: [] },
    strokeColor: 'rgb(0, 0, 0)'
  }
})

it('matches snapshot', () => {
  const wrapper = shallowMount(SkeletonEditor, { localVue, mocks, propsData })
  expect(wrapper).toMatchSnapshot()
})

it('should emit change when change is detected from node', async () => {
  const nodes: SkeletonMetadata['nodes'] = [
    { name: 'node1', x: 0, y: 0 },
    { name: 'node2', x: 10, y: 10 }
  ]
  const edges: SkeletonMetadata['edges'] = [
    { from: nodes[0].name, to: nodes[1].name }
  ]
  propsData.skeleton = { nodes, edges }

  const wrapper = shallowMount(SkeletonEditor, { localVue, mocks, propsData })
  await wrapper.vm.$nextTick()
  await wrapper.findAll('skeleton-node-stub').at(0).vm.$emit('change')
  expect(wrapper.emitted().change).toHaveLength(1)
})
