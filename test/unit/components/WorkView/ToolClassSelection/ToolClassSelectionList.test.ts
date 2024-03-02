import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import {
  buildAnnotationClassPayload,
  buildDatasetPayload,
  buildToolConfigEntry
} from 'test/unit/factories'

import ToolClassSelectionList from '@/components/WorkView/ToolClassSelection/ToolClassSelectionList.vue'
import { Editor } from '@/engine/editor'
import { Tool, ItemManager } from '@/engine/managers'
import { AnnotationClassPayload } from '@/store/types'

const localVue = createLocalVue()
localVue.directive('close-popover', () => {})
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>

let propsData: {
  annotationClasses: AnnotationClassPayload[],
  editor: Editor
}
let mocks: { $can: Function }

beforeEach(() => {
  store = createTestStore()
  mocks = { $can: () => true }

  store.commit('workview/PRESELECT_CLASS_ID', 1)
  store.commit('workview/SET_DATASET', buildDatasetPayload())
  propsData = {
    annotationClasses: [
      buildAnnotationClassPayload({ id: 1, name: 'Class 1', annotation_types: ['bounding_box'] }),
      buildAnnotationClassPayload({ id: 2, name: 'Class 2', annotation_types: ['bounding_box'] })
    ],
    editor: new Editor(new ItemManager(store), store)
  }
  jest.spyOn(propsData.editor.camera, 'setImage').mockImplementation(jest.fn)
})

it('matches snapshot', () => {
  const wrapper = shallowMount(ToolClassSelectionList, { localVue, mocks, propsData, store })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when cannot create class', () => {
  mocks.$can = () => false
  const wrapper = shallowMount(ToolClassSelectionList, { localVue, mocks, propsData, store })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when dataset hotkey is set', () => {
  store.commit('workview/SET_DATASET', buildDatasetPayload({ annotation_hotkeys: { 1: 'select_class:2' } }))
  const wrapper = shallowMount(ToolClassSelectionList, { localVue, mocks, propsData, store })
  expect(wrapper.findAll('tool-class-selection-item-stub')).toHaveLength(2)
  expect(wrapper).toMatchSnapshot()
})

it('rendered searched items', async () => {
  const wrapper = shallowMount(ToolClassSelectionList, { localVue, mocks, propsData, store })
  await wrapper.find('search-field-stub').vm.$emit('input', 'Class 1')
  expect(wrapper.findAll('tool-class-selection-item-stub')).toHaveLength(1)
  expect(wrapper).toMatchSnapshot()
})

it('rendered nothing when no matching class', async () => {
  const wrapper = shallowMount(ToolClassSelectionList, { localVue, mocks, propsData, store })
  await wrapper.find('search-field-stub').vm.$emit('input', 'Class test')
  expect(wrapper.findAll('tool-class-selection-item-stub')).toHaveLength(0)
  expect(wrapper).toMatchSnapshot()
})

it('emits add-class when create class is clicked', async () => {
  const wrapper = shallowMount(ToolClassSelectionList, { localVue, mocks, propsData, store })
  await wrapper.find('tool-class-selection-create-item-stub').vm.$emit('click')
  expect(wrapper.emitted()['add-class']).toHaveLength(1)
})

it('emits esc when search field emits esc', async () => {
  const wrapper = shallowMount(ToolClassSelectionList, { localVue, mocks, propsData, store })
  await wrapper.find('search-field-stub').vm.$emit('esc')
  expect(wrapper.emitted().esc).toHaveLength(1)
})

describe('select annotation class', () => {
  it('preselects class when no annotation class is selected', async () => {
    const wrapper = shallowMount(ToolClassSelectionList, { localVue, mocks, propsData, store })
    jest.spyOn(store, 'commit').mockReturnValue(undefined)
    await wrapper.find('tool-class-selection-item-stub').vm.$emit('select', propsData.annotationClasses[0])
    expect(store.commit).toBeCalledWith('workview/PRESELECT_CLASS_ID', propsData.annotationClasses[0].id)
  })

  it("preselects the selected annotation's annotation class", async () => {
    const wrapper = shallowMount(ToolClassSelectionList, { localVue, mocks, propsData, store })
    const { annotationClasses, editor } = propsData
    const editTool: Tool = {
      activate () { },
      deactivate () { },
      reset () { }
    }
    const { toolManager } = editor
    toolManager.registerTool('edit_tool', editTool, buildToolConfigEntry('edit_tool', ['polygon']))
    toolManager.activateTool('edit_tool')

    jest.spyOn(editor, 'maybeChangeSelectedAnnotationClass').mockReturnValue(true)
    jest.spyOn(store, 'commit').mockReturnValue(undefined)
    await wrapper.find('tool-class-selection-item-stub').vm.$emit('select', annotationClasses[0])
    expect(editor.maybeChangeSelectedAnnotationClass).toHaveBeenCalled()
    expect(store.commit).toBeCalledWith('workview/PRESELECT_CLASS_ID_WITHOUT_TOOL_CHANGE', annotationClasses[0].id)
  })
})

describe('keydown', () => {
  it('arrow-down highlights the next annotation class', async () => {
    const wrapper = shallowMount(ToolClassSelectionList, { localVue, mocks, propsData, store })
    const mockKeyEvent = {
      key: 'ArrowDown',
      preventDefault: jest.fn()
    }
    expect(wrapper.vm.$data.highlightedClassIndex).toBe(0)
    await wrapper.find('search-field-stub').vm.$emit('keydown', mockKeyEvent)
    expect(wrapper.vm.$data.highlightedClassIndex).toBe(1)
  })

  it('arrow-up highlights the next annotation class', async () => {
    const { annotationClasses } = propsData
    store.commit('workview/PRESELECT_CLASS_ID_WITHOUT_TOOL_CHANGE', annotationClasses[1].id)
    const wrapper = shallowMount(ToolClassSelectionList, { localVue, mocks, propsData, store })
    const mockKeyEvent = {
      key: 'ArrowUp',
      preventDefault: jest.fn()
    }
    expect(wrapper.vm.$data.highlightedClassIndex).toBe(1)
    await wrapper.find('search-field-stub').vm.$emit('keydown', mockKeyEvent)
    expect(wrapper.vm.$data.highlightedClassIndex).toBe(0)
  })

  it('enter selects the highlighted annotation class', async () => {
    const wrapper = shallowMount(ToolClassSelectionList, { localVue, mocks, propsData, store })
    const mockKeyEvent = {
      key: 'ArrowDown',
      preventDefault: jest.fn()
    }
    jest.spyOn(store, 'commit').mockReturnValue(undefined)
    expect(wrapper.vm.$data.highlightedClassIndex).toBe(0)
    await wrapper.find('search-field-stub').vm.$emit('keydown', mockKeyEvent)
    await wrapper.find('search-field-stub').vm.$emit('enter')
    expect(store.commit).toBeCalledWith('workview/PRESELECT_CLASS_ID', propsData.annotationClasses[1].id)
  })
})
