import { createLocalVue, mount, shallowMount } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import Vuex from 'vuex'

import { createMockTheme } from 'test/unit/components/mocks'
import createTestStore from 'test/unit/createTestStore'
import { stubDirectiveWithAttribute } from 'test/unit/directiveStubs'
import {
  buildAnnotationClassPayload,
  buildDatasetPayload,
  buildTeamPayload,
  buildUserPayload
} from 'test/unit/factories'
import { initializeARWorkflow } from 'test/unit/factories/helpers'

import { Editor } from '@/engine/editor'
import { ItemManager } from '@/engine/managers'
import { ThemeType } from '@/plugins/theme'
import { createAnnotationClass } from '@/store/modules/aclass/actions/createAnnotationClass'
import { Ability, StoreActionPayload } from '@/store/types'
import { getAutoAnnotationClassColor } from '@/utils'

import TagApplier from './TagApplier.vue'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.directive('tooltip', stubDirectiveWithAttribute)
localVue.directive('click-outside', () => {})
localVue.component('ResizeObserver', { template: '<div />' })

const tagClass = buildAnnotationClassPayload({
  id: 1,
  name: 'tag',
  description: 'tag',
  datasets: [{ id: 11 }],
  annotation_types: ['tag'],
  metadata: { _color: 'rgba(255,255,255,1)' }
})

// control, belongs to dataset that isn't sfh
const tagClassOtherDataset = buildAnnotationClassPayload({
  id: 2,
  name: 'tag2',
  description: 'tag',
  datasets: [{ id: 50 }],
  annotation_types: ['tag'],
  metadata: { _color: 'rgba(255,255,255,1)' }
})

const sfh = buildDatasetPayload({ id: 11, name: 'SFH' })

const v7 = buildTeamPayload({ id: 1 })
const user = buildUserPayload({ id: 1, first_name: 'Test', last_name: 'User1' })

let store: ReturnType<typeof createTestStore>
let editor: Editor
let propsData: { disabled?: boolean, editor: Editor }
let mocks: {
  $can: () => boolean
  $theme: ThemeType
}

const item = initializeARWorkflow({ dataset_id: sfh.id })

beforeEach(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {})
  store = createTestStore()
  store.commit('user/SET_PROFILE', user)

  store.commit('aclass/SET_CLASSES', [tagClass, tagClassOtherDataset])
  store.commit('workview/SET_DATASET', sfh)

  store.commit('workview/PUSH_DATASET_ITEMS', [item])
  store.commit('team/SET_CURRENT_TEAM', v7)
  store.commit('workview/SET_SELECTED_DATASET_ITEM', item)

  editor = new Editor(new ItemManager(store), store)
  editor.init()
  editor.activeView.setAnnotationClasses(store.state.aclass.classes)
  editor.installAllPlugins(editor.pluginManager.pluginsForDataset(sfh, []))

  propsData = { editor }
  mocks = {
    $can: jest.fn().mockReturnValue(true),
    $theme: createMockTheme()
  }
})

it('matches snapshot', () => {
  const wrapper = shallowMount(TagApplier, { localVue, mocks, propsData, store })
  expect(wrapper).toMatchSnapshot()
})

it('renders only classes belonging to dataset', () => {
  const wrapper = shallowMount(TagApplier, { localVue, mocks, propsData, store })
  expect((wrapper.vm as unknown as { datasetTags: unknown[] }).datasetTags).toHaveLength(1)
})

it('creates annotation when you click on the item on the list', async () => {
  const wrapper = mount(TagApplier, { localVue, mocks, propsData, store })
  const list = wrapper.find('.tag-applier__list')
  await list.vm.$emit('click')
  const ListItems = wrapper.findAll('.list-element')
  const firstListItem = ListItems.at(0)
  firstListItem.vm.$emit('click')
  expect(store.dispatch).toHaveBeenCalledWith(
    'workview/createStageAnnotation',
    expect.objectContaining({
      annotation_class_id: tagClass.id,
      data: { tag: {} }
    })
  )
})

const newClass = buildAnnotationClassPayload({
  id: 2,
  datasets: [{ id: sfh.id }],
  annotation_types: ['tag'],
  metadata: { _color: 'rgba(255,222,111,1.0)' }
})

it('creates a new annotation class when clicking on the create button', async () => {
  const abilities: Ability[] = [{ subject: 'all', actions: ['create_annotation_class'] }]
  store.commit('auth/SET_ABILITIES', abilities)

  const wrapper = mount(TagApplier, { localVue, mocks, propsData, store })

  const dispatch = store.dispatch as jest.Mock
  dispatch.mockResolvedValue({ data: newClass })
  await wrapper.setData({ keyword: 'new tag' })

  const tagApplierCreate = wrapper.find('.tag-applier__create')
  tagApplierCreate.vm.$emit('create', 'new tag')
  // simulate class being created and added to store
  store.commit('aclass/PUSH_CLASS', newClass)
  await flushPromises()

  const expectedPayload: StoreActionPayload<typeof createAnnotationClass> = {
    annotationTypeNames: ['tag'],
    datasets: [{ id: sfh.id }],
    description: 'new tag',
    images: [],
    metadata: { _color: getAutoAnnotationClassColor('new tag') },
    name: 'new tag'
  }
  expect(store.dispatch).toHaveBeenCalledWith('aclass/createAnnotationClass', expectedPayload)

  const expectedTagParams = { annotation_class_id: 2, data: { tag: {} } }
  expect(store.dispatch).toHaveBeenCalledWith(
    'workview/createStageAnnotation',
    expect.objectContaining(expectedTagParams)
  )
})

it('creates a new annotation class when focused and hitting ENTER', async () => {
  const abilities: Ability[] = [{ subject: 'all', actions: ['create_annotation_class'] }]
  store.commit('auth/SET_ABILITIES', abilities)

  const wrapper = mount(TagApplier, { localVue, mocks, propsData, store })

  const dispatch = store.dispatch as jest.Mock
  dispatch.mockResolvedValue({ data: newClass })
  await wrapper.setData({ keyword: 'new tag' })
  const tagApplierInput = wrapper.find('.tag-applier__input')
  const inputField = wrapper.find('.input-field')
  await tagApplierInput.setData({ focused: true })
  inputField.vm.$emit('change:multiple')
  // simulate class being created and added to store
  store.commit('aclass/PUSH_CLASS', newClass)
  await flushPromises()

  const expectedClassParams: StoreActionPayload<typeof createAnnotationClass> = {
    annotationTypeNames: ['tag'],
    datasets: [{ id: sfh.id }],
    description: 'new tag',
    images: [],
    metadata: { _color: getAutoAnnotationClassColor('new tag') },
    name: 'new tag'
  }
  expect(store.dispatch).toHaveBeenCalledWith('aclass/createAnnotationClass', expectedClassParams)

  const expectedTagParams = { annotation_class_id: 2, data: { tag: {} } }
  expect(store.dispatch).toHaveBeenCalledWith(
    'workview/createStageAnnotation',
    expect.objectContaining(expectedTagParams)
  )
})

it('does nothing when not focused and hitting ENTER', async () => {
  const abilities: Ability[] = [{ subject: 'all', actions: ['create_annotation_class'] }]
  store.commit('auth/SET_ABILITIES', abilities)

  const wrapper = mount(TagApplier, { localVue, mocks, propsData, store })

  const dispatch = store.dispatch as jest.Mock
  dispatch.mockResolvedValue({ data: newClass })
  await wrapper.setData({ keyword: 'new tag' })
  const tagApplierInput = wrapper.find('.tag-applier__input')
  const inputField = wrapper.find('.input-field')
  await tagApplierInput.setData({ focused: false })
  inputField.vm.$emit('change:multiple')
  // simulate class being created and added to store
  store.commit('aclass/PUSH_CLASS', newClass)
  await flushPromises()

  const expectedClassParams: StoreActionPayload<typeof createAnnotationClass> = {
    annotationTypeNames: ['tag'],
    datasets: [{ id: sfh.id }],
    description: 'new tag',
    images: [],
    metadata: { _color: getAutoAnnotationClassColor('new tag') },
    name: 'new tag'
  }
  expect(store.dispatch).not.toHaveBeenCalledWith('aclass/createAnnotationClass', expectedClassParams)

  const expectedTagParams = { annotation_class_id: 2, data: { tag: {} } }
  expect(store.dispatch).not.toHaveBeenCalledWith(
    'workview/createStageAnnotation',
    expect.objectContaining(expectedTagParams)
  )
})

describe('when disabled', () => {
  beforeEach(() => { propsData.disabled = true })

  it('matches snapshot', () => {
    const wrapper = shallowMount(TagApplier, { localVue, mocks, propsData, store })
    expect(wrapper).toMatchSnapshot()
  })
})

describe('when annotator', () => {
  beforeEach(() => {
    mocks.$can = jest.fn().mockReturnValue(false)
  })

  it('matches snapshot', () => {
    const wrapper = shallowMount(TagApplier, { localVue, mocks, propsData, store })
    expect(wrapper).toMatchSnapshot()
  })

  it('does not show create button', async () => {
    const wrapper = shallowMount(TagApplier, { localVue, mocks, propsData, store })
    await flushPromises()
    const dispatch = (store.dispatch as jest.Mock)
    dispatch.mockClear()
    expect(wrapper.find('tag-applier-create-stub').exists()).toBe(false)
  })

  it('does not create when hitting ENTER', async () => {
    const wrapper = shallowMount(TagApplier, { localVue, mocks, propsData, store })
    await flushPromises()
    const dispatch = (store.dispatch as jest.Mock)
    dispatch.mockClear()

    await wrapper.setData({ keyword: 'new tag' })
    const inputField = wrapper.find('tag-applier-input-stub')
    inputField.vm.$emit('create')

    await flushPromises()
    expect(store.dispatch).not.toHaveBeenCalled()
  })
})
