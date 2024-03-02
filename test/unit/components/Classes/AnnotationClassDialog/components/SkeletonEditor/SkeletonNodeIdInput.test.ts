import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buildSkeletonNodeType } from 'test/unit/factories'

import SkeletonNodeIdInput from '@/components/Classes/AnnotationClassDialog/components/SkeletonEditor/SkeletonNodeIdInput.vue'
import SkeletonEditorEngine from '@/components/Classes/AnnotationClassDialog/components/SkeletonEditor/engine/SkeletonEditorEngine'
import { SkeletonNodeType } from '@/components/Classes/AnnotationClassDialog/components/SkeletonEditor/engine/types'

const localVue = createLocalVue()
localVue.use(Vuex)

let propsData: {
  engine: SkeletonEditorEngine
  node: SkeletonNodeType
}
let store: ReturnType<typeof createTestStore>

beforeEach(() => {
  propsData = {
    engine: new SkeletonEditorEngine(jest.fn()),
    node: buildSkeletonNodeType()
  }
  store = createTestStore()
})

it('matches snapshot', () => {
  const wrapper = shallowMount(SkeletonNodeIdInput, { localVue, propsData, store })
  expect(wrapper).toMatchSnapshot()
})

it('dispatches toast message when value is empty and saved', () => {
  const wrapper = shallowMount(SkeletonNodeIdInput, { localVue, propsData, store })
  const inputField = wrapper.find('input') as any
  inputField.element.value = ''
  inputField.trigger('input')
  inputField.trigger('keyup.enter')
  expect(store.dispatch).toBeCalledWith('toast/warning', { content: 'Skeleton Node ID cannot be empty' })
})

it('emits saved when value is valid and saved', () => {
  const wrapper = shallowMount(SkeletonNodeIdInput, { localVue, propsData, store })
  const inputField = wrapper.find('input') as any
  inputField.element.value = 'node id'
  inputField.trigger('input')
  inputField.trigger('keyup.enter')
  expect(wrapper.emitted().saved).toHaveLength(1)
})

it('setSelectionRange is called when selectAll is called', () => {
  const wrapper = shallowMount(SkeletonNodeIdInput, { localVue, propsData, store })

  const vm = wrapper.vm as any
  vm.$refs.input = {
    focus: jest.fn(),
    setSelectionRange: jest.fn()
  }
  vm.selectAll()

  expect(vm.$refs.input.setSelectionRange).toBeCalledWith(0, propsData.node.label!.length)
})

it('focus is called when setFocus is called', () => {
  jest.useFakeTimers()

  const wrapper = shallowMount(SkeletonNodeIdInput, { localVue, propsData, store })

  const vm = wrapper.vm as any
  vm.$refs.input = {
    focus: jest.fn(),
    setSelectionRange: jest.fn()
  }
  vm.setFocus()
  jest.runAllTimers()

  expect(vm.$refs.input.focus).toBeCalled()
})
