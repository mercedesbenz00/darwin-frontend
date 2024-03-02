import { createLocalVue, shallowMount, Slots, Stubs } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import {
  buildAnnotationClassPayload,
  buildAnnotationTypePayload,
  buildDatasetPayload
} from 'test/unit/factories'
import { VPopover } from 'test/unit/stubs'

import { AddTagPayload, RemoveTagPayload } from '@/components/Common/TagApplier/types'
import TagsPopover from '@/components/Dataset/DropZone/FileSet/TagsPopover.vue'
import { createAnnotationClass } from '@/store/modules/aclass/actions/createAnnotationClass'
import {
  AnnotationClassPayload,
  AnnotationTypePayload,
  DatasetPayload,
  InputTag,
  StoreActionPayload
} from '@/store/types'

const localVue = createLocalVue()
localVue.use(Vuex)
let store: ReturnType<typeof createTestStore>

let dataset: DatasetPayload
let tagClasses: AnnotationClassPayload[]
let tagAnnotationType: AnnotationTypePayload

let propsData: {
  tags: string[]
  dataset: DatasetPayload
}
const slots: Slots = {
  default: {
    template: '<div class="default-slot"/>'
  }
}
const stubs: Stubs = { VPopover }

beforeEach(() => {
  store = createTestStore()
  dataset = buildDatasetPayload({ id: 1 })
  tagClasses = [
    buildAnnotationClassPayload({
      id: 2,
      annotation_types: ['tag'],
      datasets: [{ id: 1 }],
      name: 'tag1'
    }),
    buildAnnotationClassPayload({
      id: 3,
      annotation_types: ['tag'],
      datasets: [{ id: 1 }],
      name: 'tag2'
    }),
    buildAnnotationClassPayload({
      id: 3,
      annotation_types: ['tag'],
      datasets: [{ id: 1 }],
      name: 'tag3'
    })
  ]
  tagAnnotationType = buildAnnotationTypePayload({ name: 'tag' })
  propsData = {
    tags: ['tag1', 'tag2'],
    dataset
  }
  store.commit('aclass/SET_CLASSES', tagClasses)
  store.commit('aclass/SET_TYPES', [tagAnnotationType])
})

it('matches snapshot', () => {
  const wrapper = shallowMount(TagsPopover, { localVue, propsData, slots, store, stubs })
  expect(wrapper).toMatchSnapshot()
})

it('should emit change when a tag is added', async () => {
  const wrapper = shallowMount(TagsPopover, { localVue, propsData, slots, store, stubs })
  await wrapper.find('tag-applier-list-stub').vm.$emit('add-tag', tagClasses[2])
  expect(wrapper.emitted().change).toEqual([[[
    'tag1',
    'tag2',
    'tag3'
  ]]])
})

it('should create a new tag and emit change when a new tag is created', async () => {
  const wrapper = shallowMount(TagsPopover, { localVue, propsData, slots, store, stubs })
  await wrapper.find('tag-applier-list-stub').vm.$emit('create-tag', { text: 'tag4' } as InputTag)

  const payload: StoreActionPayload<typeof createAnnotationClass> = {
    annotationTypeNames: [tagAnnotationType.name],
    datasets: [{ id: dataset.id }],
    description: 'tag4',
    images: [],
    metadata: { _color: 'auto' },
    name: 'tag4'
  }
  expect(store.dispatch).toHaveBeenCalledWith('aclass/createAnnotationClass', payload)

  await flushPromises()
  expect(wrapper.emitted().change).toEqual([[[
    'tag1',
    'tag2',
    'tag4'
  ]]])
})

it('should create a new tag and emit change when input creates a new tag', async () => {
  const wrapper = shallowMount(TagsPopover, { localVue, propsData, slots, store, stubs })
  const mockAddTag = jest.fn()
  await wrapper.find('tag-applier-input-stub').vm.$emit('new-tag', {
    tag: { text: 'tag4' },
    addTag: mockAddTag
  } as AddTagPayload)

  const payload: StoreActionPayload<typeof createAnnotationClass> = {
    annotationTypeNames: [tagAnnotationType.name],
    datasets: [{ id: dataset.id }],
    description: 'tag4',
    images: [],
    metadata: { _color: 'auto' },
    name: 'tag4'
  }
  expect(store.dispatch).toHaveBeenCalledWith('aclass/createAnnotationClass', payload)

  await flushPromises()
  expect(wrapper.emitted().change).toEqual([[[
    'tag1',
    'tag2',
    'tag4'
  ]]])
})

it('should remove existing tag and emit change when tag is removed', async () => {
  const wrapper = shallowMount(TagsPopover, { localVue, propsData, slots, store, stubs })
  await wrapper.find('tag-applier-input-stub').vm.$emit('remove-tag', {
    tag: { text: 'tag2' }
  } as RemoveTagPayload)
  expect(wrapper.emitted().change).toEqual([[['tag1']]])
})

it('toasts error if creating tag failed', async () => {
  (store.dispatch as jest.Mock).mockResolvedValue({ error: { name: 'Fake error' } })
  const wrapper = shallowMount(TagsPopover, { localVue, propsData, slots, store, stubs })
  const mockAddTag = jest.fn()
  await wrapper.find('tag-applier-input-stub').vm.$emit('new-tag', {
    tag: { text: 'tag4' },
    addTag: mockAddTag
  } as AddTagPayload)
  await flushPromises()
  expect(store.dispatch).toHaveBeenCalledWith('toast/warning', { content: 'Fake error' })
})
