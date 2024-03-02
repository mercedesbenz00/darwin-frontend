import { createLocalVue, shallowMount, Stubs, Wrapper } from '@vue/test-utils'
import Vuex from 'vuex'

import { createTestStore, setDefaultAnnotationTypes } from 'test/unit/createTestStore'
import { stubDirectiveWithAttribute } from 'test/unit/directiveStubs'
import { buildAnnotationClassPayload, buildDatasetPayload } from 'test/unit/factories'
import { VPopover } from 'test/unit/stubs'

import ToolClassSelection from '@/components/WorkView/ToolClassSelection/ToolClassSelection.vue'
import { Editor } from '@/engine/editor'
import { ItemManager } from '@/engine/managers'

const localVue = createLocalVue()
localVue.directive('tooltip', stubDirectiveWithAttribute)
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>
let propsData: {
  editor: Editor
}
const stubs: Stubs = { VPopover }

beforeEach(() => {
  store = createTestStore()
  setDefaultAnnotationTypes(store)
  store.commit('workview/SET_DATASET', buildDatasetPayload({ id: 9 }))
  store.commit('workview/SET_TOOL_ANNOTATION_TYPES', ['bounding_box'])
  store.commit('workview/PRESELECT_CLASS_ID', 1)
  store.commit('aclass/SET_CLASSES', [
    buildAnnotationClassPayload({
      id: 1,
      annotation_types: ['bounding_box'],
      datasets: [{ id: 9 }]
    }),
    buildAnnotationClassPayload({
      id: 2,
      annotation_types: ['bounding_box'],
      datasets: [{ id: -1 }]
    })
  ])
  propsData = {
    editor: new Editor(new ItemManager(store), store)
  }
  jest.spyOn(propsData.editor.camera, 'setImage').mockImplementation(jest.fn)
})

class Model {
  wrapper: Wrapper<Vue>

  constructor (wrapper: Wrapper<Vue>) {
    this.wrapper = wrapper
  }

  get availableClasses () {
    const wrapperList = this.wrapper.findAll('.tool-class')
    return {
      length: wrapperList.length
    }
  }
}

it('matches snapshot', () => {
  const wrapper = shallowMount(ToolClassSelection, { localVue, propsData, store, stubs })
  expect(wrapper).toMatchSnapshot()
})

it('renders only classes belonging to dataset', () => {
  const wrapper = shallowMount(ToolClassSelection, { localVue, propsData, store, stubs })
  const model = new Model(wrapper)
  expect(model.availableClasses.length).toBe(1)
})

it('opens the popover when "q" is pressed', async () => {
  const wrapper = shallowMount(ToolClassSelection, { localVue, propsData, store, stubs })
  await wrapper.setData({ active: false })
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'q' }))
  expect(wrapper.vm.$data.active).toBeTruthy()
})

it('closes the popover when Esc is pressed', async () => {
  const wrapper = shallowMount(ToolClassSelection, { localVue, propsData, store, stubs })
  await wrapper.setData({ active: true })
  await wrapper.find('tool-class-selection-list-stub').vm.$emit('esc')
  expect(wrapper.vm.$data.active).toBeFalsy()
})

it('closes the popover when item is selected', async () => {
  const wrapper = shallowMount(ToolClassSelection, { localVue, propsData, store, stubs })
  await wrapper.setData({ active: true })
  await wrapper.find('tool-class-selection-list-stub').vm.$emit('selected')
  expect(wrapper.vm.$data.active).toBeFalsy()
})
