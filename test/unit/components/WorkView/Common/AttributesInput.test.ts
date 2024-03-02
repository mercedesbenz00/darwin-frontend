import { shallowMount, createLocalVue, Stubs } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { stubDirectiveWithAttribute } from 'test/unit/directiveStubs'
import { buildAnnotation, buildAttributePayload, buildDatasetPayload } from 'test/unit/factories'
import { VueTagsInput } from 'test/unit/stubs'

import AttributesInput from '@/components/WorkView/Common/AttributesInput/AttributesInput.vue'
import { Editor } from '@/engine/editor'
import { ItemManager } from '@/engine/managers'
import { Annotation } from '@/engine/models'
import { tagFromAttribute } from '@/engine/plugins/attributes/utils'
import { AttributePayload, DatasetPayload, InputTag } from '@/store/types'
import { errorsByCode, getAttributeColor } from '@/utils'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.directive('click-outside', stubDirectiveWithAttribute)

let store: ReturnType<typeof createTestStore>
let attributes: AttributePayload[]
let classId: number
let dataset: DatasetPayload
let editor: Editor

let propsData: {
  editor: Editor,
  masterAnnotation: Annotation | null,
  tags: InputTag[]
}
let mocks: { $can: () => boolean }
const stubs: Stubs = { VueTagsInput }

beforeEach(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {})

  store = createTestStore()
  dataset = buildDatasetPayload({ id: 1 })

  editor = new Editor(new ItemManager(store), store)
  const plugins = editor.pluginManager.pluginsForDataset(dataset, [])
  editor.installAllPlugins(plugins)

  classId = 1
  attributes = [
    buildAttributePayload({ id: '1', class_id: classId, name: 'attribute 1' }),
    buildAttributePayload({ id: '2', class_id: classId, name: 'attribute 2' })
  ]
  store.commit('aclass/SET_ANNOTATION_ATTRIBUTE', { classId, attributes })

  propsData = {
    editor,
    masterAnnotation: buildAnnotation(editor, { classId }),
    tags: []
  }
  mocks = { $can: () => true }
})

const itMatchesSnapshot = () => it('matches snapshot', () => {
  const wrapper = shallowMount(AttributesInput, { localVue, propsData, mocks, store, stubs })
  expect(wrapper).toMatchSnapshot()
})

describe('with no selected attributes', () => {
  itMatchesSnapshot()

  it('shows all the attributes in the list', () => {
    const wrapper = shallowMount(AttributesInput, { localVue, propsData, mocks, store, stubs })
    expect(wrapper.findAll('.workview-attributes__tag')).toHaveLength(attributes.length)
  })

  it('creates a new tag if it is not in the attributes list', async () => {
    const wrapper = shallowMount(AttributesInput, { localVue, propsData, mocks, store, stubs })
    jest.spyOn(store, 'dispatch').mockResolvedValue({
      data: buildAttributePayload({ id: '3', class_id: classId, name: 'attribute 3' })
    })

    await wrapper.findComponent({ name: 'vue-tags-input' }).vm.$emit('input', 'new tag')
    jest.spyOn(editor, 'initializeSubAnnotation').mockReturnValue(null)
    await wrapper.find('button.workview-attributes__create').trigger('click')

    expect(store.dispatch).toBeCalledWith(
      'aclass/createOrFetchAnnotationAttribute',
      { classId, name: 'new tag', color: getAttributeColor('new tag') }
    )
  })

  it('shows highlighted item when pressing Arrow Down/Up key', async () => {
    const wrapper = shallowMount(AttributesInput, { localVue, propsData, mocks, store, stubs })
    expect(wrapper.find('.workview-attributes__tag.workview-attributes__tag--highlighted').element.id).toEqual('attribute-tag-1')
    const vm = wrapper.vm as any
    const mockedEvent = {
      key: 'ArrowDown',
      preventDefault: jest.fn(),
      stopPropagation: jest.fn()
    }
    vm.onKeyDown(mockedEvent)
    await vm.$nextTick()
    expect(wrapper.find('.workview-attributes__tag.workview-attributes__tag--highlighted').element.id).toEqual('attribute-tag-2')

    mockedEvent.key = 'ArrowUp'
    vm.onKeyDown(mockedEvent)
    await vm.$nextTick()
    expect(wrapper.find('.workview-attributes__tag.workview-attributes__tag--highlighted').element.id).toEqual('attribute-tag-1')
  })

  it('clear the input field by attribute mouse click', () => {
    const wrapper = shallowMount(AttributesInput, { localVue, propsData, mocks, store, stubs })
    const spy = jest.spyOn(wrapper.vm as any, 'resetInput')

    wrapper.findAll('.workview-attributes__tag').at(1).trigger('click')
    expect(spy).toHaveBeenCalled()
  })
})

describe('with some selected attributes', () => {
  beforeEach(() => {
    propsData = {
      editor,
      masterAnnotation: buildAnnotation(editor, { classId }),
      tags: [tagFromAttribute(attributes[0])]
    }
  })

  itMatchesSnapshot()

  it('shows non-selected attributes in the list', () => {
    const wrapper = shallowMount(AttributesInput, { localVue, propsData, mocks, store, stubs })
    expect(wrapper.findAll('.workview-attributes__tag')).toHaveLength(attributes.length - 1)
  })
})

describe('when esc is pressed', () => {
  it('emits hide', async () => {
    const wrapper = shallowMount(AttributesInput, { localVue, propsData, mocks, store, stubs })
    const vm = wrapper.vm as any
    const mockedEvent = {
      key: 'Escape',
      preventDefault: jest.fn(),
      stopPropagation: jest.fn()
    }
    vm.onKeyDown(mockedEvent)
    await vm.$nextTick()

    expect(wrapper.emitted().hide).toHaveLength(1)
  })
})

describe('when not have access to create tags', () => {
  beforeEach(() => {
    mocks = { $can: () => false }
  })

  itMatchesSnapshot()

  it('never shows create tag button', () => {
    const wrapper = shallowMount(AttributesInput, { localVue, propsData, mocks, store, stubs })
    expect(wrapper.find('button.workview-attributes__create').exists()).toBeFalsy()
  })

  it('never creates a new tag', async () => {
    const wrapper = shallowMount(AttributesInput, { localVue, propsData, mocks, store, stubs })
    await wrapper.setData({ highlightedTagIndex: -1 })
    await wrapper.findComponent({ name: 'vue-tags-input' }).vm
      .$emit('before-adding-tag', { tag: { text: 'new tag' } })

    expect(store.dispatch).toBeCalledWith(
      'toast/warning',
      { content: errorsByCode.ANNOTATION_CREATE_ATTRIBUTE_NOT_AUTHORIZED }
    )
  })
})
