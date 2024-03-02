import { createLocalVue, shallowMount } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import Vuex from 'vuex'

import createTestStore, { setDefaultAnnotationTypes } from 'test/unit/createTestStore'
import {
  buildAnnotationClassPayload,
  buildDatasetPayload,
  buildDatasetItemPayload,
  buildTeamPayload
} from 'test/unit/factories'
import { outOfSubscribedStorageError } from 'test/unit/fixtures/errors'
import { emitRootStub, nthEmitted } from 'test/unit/testHelpers'

import { createAnnotationClass } from '@/store/modules/aclass/actions/createAnnotationClass'
import { DatasetPayload, StoreActionPayload } from '@/store/types'

import ClassFilter from './ClassFilter.vue'

const localVue = createLocalVue()
localVue.use(Vuex)

const stubs = ['class-filter']
const mocks = {}
let propsData: {
  dataset: DatasetPayload
  positiveClassIds: number[],
  negativeClassIds: number[],
  imagesSelecting?: boolean
}
let store: ReturnType<typeof createTestStore>

const v7 = buildTeamPayload({ id: 10 })
const dataset = buildDatasetPayload({ id: 1 })

beforeEach(() => {
  store = createTestStore()
  setDefaultAnnotationTypes(store)
  store.commit('team/SET_CURRENT_TEAM', v7)
  store.commit('aclass/SET_CLASSES', [
    buildAnnotationClassPayload({ id: 1, annotation_types: ['tag'] }),
    buildAnnotationClassPayload({ id: 2, annotation_types: ['bounding_box'] })
  ])
  store.commit('dataset/SET_DATASET_ITEMS', [
    buildDatasetItemPayload({ id: 1 })
  ])
  jest.spyOn(store, 'dispatch').mockResolvedValue({})

  propsData = {
    dataset,
    positiveClassIds: [],
    negativeClassIds: [],
    imagesSelecting: true
  }
})

describe('filtering by class filter', () => {
  it('filters by positive class when class selected', () => {
    const wrapper = shallowMount(ClassFilter, { localVue, mocks, propsData, store, stubs })

    emitRootStub(wrapper, 'change', { positiveOptions: [1, 2] })

    expect(nthEmitted(wrapper, 'update:positive-class-ids', 0)).toEqual([[1, 2]])
    expect(nthEmitted(wrapper, 'change', 0)).toEqual([{ positiveOptions: [1, 2] }])

    emitRootStub(wrapper, 'change', { positiveOptions: [] })
    expect(nthEmitted(wrapper, 'update:positive-class-ids', 1)).toEqual([[]])
    expect(nthEmitted(wrapper, 'change', 1)).toEqual([{ positiveOptions: [] }])
  })

  it('filters by negative class when class selected', () => {
    const wrapper = shallowMount(ClassFilter, { localVue, mocks, propsData, store, stubs })

    emitRootStub(wrapper, 'change', { negativeOptions: [1, 2] })

    expect(nthEmitted(wrapper, 'update:negative-class-ids', 0)).toEqual([[1, 2]])
    expect(nthEmitted(wrapper, 'change', 0)).toEqual([{ negativeOptions: [1, 2] }])

    emitRootStub(wrapper, 'change', { negativeOptions: [] })
    expect(nthEmitted(wrapper, 'update:negative-class-ids', 1)).toEqual([[]])
    expect(nthEmitted(wrapper, 'change', 1)).toEqual([{ negativeOptions: [] }])
  })
})

describe('tagging with class filter', () => {
  it('create a new tag and reload the team', async () => {
    const wrapper = shallowMount(ClassFilter, { localVue, mocks, propsData, store, stubs })
    const component = wrapper.vm as any
    component.$refs.classFilter = { resetTagInput: () => {} }

    await emitRootStub(wrapper, 'create-tag', 'new tag')
    const expected: StoreActionPayload<typeof createAnnotationClass> = {
      annotationTypeNames: ['tag'],
      datasets: [{ id: 1 }],
      description: 'new tag',
      images: [],
      metadata: { _color: 'auto' },
      name: 'new tag'
    }
    expect(store.dispatch).toHaveBeenCalledWith('aclass/createAnnotationClass', expected)

    await flushPromises()

    expect(store.dispatch).toHaveBeenCalledWith('dataset/loadDatasetItemCounts', { dataset })
  })

  it('tag selected imagees', async () => {
    const wrapper = shallowMount(ClassFilter, { localVue, mocks, propsData, store, stubs })

    await emitRootStub(wrapper, 'tag', store.state.dataset.datasetItems[0])
    expect(store.dispatch).toHaveBeenCalledWith(
      'dataset/tagSelectedItems',
      { annotationClassId: 1, dataset }
    )
  })

  it(`shows storage dialog on ${outOfSubscribedStorageError.code}`, async () => {
    jest.spyOn(store, 'dispatch').mockResolvedValue({ error: outOfSubscribedStorageError })
    const wrapper = shallowMount(ClassFilter, { localVue, mocks, propsData, store, stubs })
    await emitRootStub(wrapper, 'tag', store.state.dataset.datasetItems[0])
    await flushPromises()
    expect(store.state.billing.outOfStorageDialogShown).toBe(true)
  })

  it('untag selected imagees', async () => {
    const wrapper = shallowMount(ClassFilter, { localVue, mocks, propsData, store, stubs })

    await emitRootStub(wrapper, 'untag', { id: 1 })
    expect(store.dispatch).toHaveBeenCalledWith(
      'dataset/untagSelectedItems',
      { annotationClassId: 1, dataset }
    )
  })
})
