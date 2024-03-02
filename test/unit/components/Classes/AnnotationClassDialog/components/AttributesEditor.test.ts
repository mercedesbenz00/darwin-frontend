import { createLocalVue, shallowMount, Stubs } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import Vuex from 'vuex'

import { createTestStore, setDefaultAnnotationTypes } from 'test/unit/createTestStore'
import { buildAttributePayload } from 'test/unit/factories'
import { VPopover, VueTagsInput } from 'test/unit/stubs'

import AttributesEditor from '@/components/Classes/AnnotationClassDialog/components/AttributesEditor.vue'
import { InputTag } from '@/store/types'

const localVue = createLocalVue()
localVue.use(Vuex)

let propsData: {
  annotationClassId?: number
  editing?: boolean
}
let store: ReturnType<typeof createTestStore>
const stubs: Stubs = {
  VPopover,
  VueTagsInput
}

beforeEach(() => {
  store = createTestStore()
  setDefaultAnnotationTypes(store)
  propsData = {
  }
})

it('matches snapshot when creating', () => {
  const wrapper = shallowMount(AttributesEditor, { localVue, propsData, store, stubs })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when editing', () => {
  propsData.editing = true
  const wrapper = shallowMount(AttributesEditor, { localVue, propsData, store, stubs })
  expect(wrapper).toMatchSnapshot()
})

describe('create new attributes', () => {
  let mocks: { $can: () => boolean }

  beforeEach(() => {
    mocks = { $can: () => true }
    propsData.annotationClassId = 1
  })

  it('adding new attribute triggers store action', async () => {
    const wrapper = shallowMount(AttributesEditor, { localVue, mocks, propsData, store, stubs })
    const newAttributeEvent = {
      tag: { id: '1', text: 'newAttribute' },
      addTag: jest.fn().mockReturnValue({})
    }
    await wrapper.find('.vue-tags-input-stub').vm.$emit('before-adding-tag', newAttributeEvent)
    expect(store.dispatch).toBeCalledWith(
      'aclass/createOrFetchAnnotationAttribute',
      { classId: 1, name: 'newAttribute', color: expect.any(String) }
    )
  })

  it('create a new attribute after saving new attribute to the backend', async () => {
    const wrapper = shallowMount(AttributesEditor, { localVue, mocks, propsData, store, stubs })
    const newAttributeEvent: { tag: InputTag, addTag: Function } = {
      tag: { id: '1', text: 'newAttribute' },
      addTag: jest.fn().mockReturnValue({})
    }

    const newAttribute = buildAttributePayload({ id: '1', name: 'newAttribute', color: '#000000' })
    jest.spyOn(store, 'dispatch').mockResolvedValue({ data: newAttribute })

    await wrapper.find('.vue-tags-input-stub').vm.$emit('before-adding-tag', newAttributeEvent)
    await flushPromises()

    expect(newAttributeEvent.tag.id).toEqual(newAttribute.id)
    expect(newAttributeEvent.tag.text).toEqual(newAttribute.name)
    expect(newAttributeEvent.tag.style).toEqual(`background: ${newAttribute.color}`)
    expect(newAttributeEvent.addTag).toBeCalled()
  })

  it('never create a new attribute after errored by the backend', async () => {
    const wrapper = shallowMount(AttributesEditor, { localVue, mocks, propsData, store, stubs })
    const newAttributeEvent: { tag: InputTag, addTag: Function } = {
      tag: { id: '1', text: 'newAttribute' },
      addTag: jest.fn().mockReturnValue({})
    }

    jest.spyOn(store, 'dispatch').mockResolvedValue({ error: {} })

    await wrapper.find('.vue-tags-input-stub').vm.$emit('before-adding-tag', newAttributeEvent)
    await flushPromises()

    expect(newAttributeEvent.addTag).not.toBeCalled()
  })

  it('cannot create new attribute when no permissions', async () => {
    mocks.$can = () => false
    const wrapper = shallowMount(AttributesEditor, { localVue, mocks, propsData, store, stubs })
    const newAttributeEvent = {
      tag: { id: '1', text: 'newAttribute' },
      addTag: jest.fn().mockReturnValue({})
    }
    await wrapper.find('.vue-tags-input-stub').vm.$emit('before-adding-tag', newAttributeEvent)
    expect(store.dispatch).toBeCalledWith('toast/warning', { content: expect.any(String) })
  })
})

describe('edit existing attribute', () => {
  let mocks: { $can: () => boolean }

  beforeEach(() => {
    mocks = { $can: () => true }
    propsData.annotationClassId = 1
  })

  it('editing new attribute triggers store action', async () => {
    const wrapper = shallowMount(AttributesEditor, { localVue, mocks, propsData, store, stubs })
    const newAttributeEvent = {
      tag: { id: '1', text: 'newAttribute' },
      saveTag: jest.fn().mockReturnValue({})
    }
    await wrapper.find('.vue-tags-input-stub').vm.$emit('before-saving-tag', newAttributeEvent)
    expect(store.dispatch).toBeCalledWith(
      'aclass/updateAnnotationAttribute',
      { classId: 1, id: '1', name: 'newAttribute', color: expect.any(String) }
    )
  })
})
