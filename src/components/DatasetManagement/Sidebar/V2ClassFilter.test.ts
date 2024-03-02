import { createLocalVue, shallowMount } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import Vuex from 'vuex'

import createTestStore, { setDefaultAnnotationTypes } from 'test/unit/createTestStore'
import {
  buildAnnotationClassPayload,
  buildDatasetPayload,
  buildV2DatasetItemPayload,
  buildTeamPayload
} from 'test/unit/factories'
import { outOfSubscribedStorageError } from 'test/unit/fixtures/errors'
import { emitRootStub, nthEmitted } from 'test/unit/testHelpers'

import { ClassFilterItemType } from '@/components/DatasetFiltering/ClassFilter/V2/types'
import { createAnnotationClass } from '@/store/modules/aclass/actions/createAnnotationClass'
import { DatasetPayload, StoreActionPayload } from '@/store/types'

import V2ClassFilter from './V2ClassFilter.vue'

const localVue = createLocalVue()
localVue.use(Vuex)

const stubs = ['class-filter']
let mocks: {
  $toast: {
    success: Function,
    warning: Function
  }
}
let propsData: {
  dataset: DatasetPayload
  positiveClassIds: number[],
  negativeClassIds: number[],
  disabled?: boolean
}
let store: ReturnType<typeof createTestStore>
const options: ClassFilterItemType[] = [{
  id: 1,
  aclass: buildAnnotationClassPayload({ id: 1 }),
  label: 'Polygon',
  icon: 'polygon.svg',
  count: 5
}, {
  id: 2,
  aclass: buildAnnotationClassPayload({ id: 2, name: 'tag' }),
  label: 'Tag',
  icon: 'tag.svg',
  count: 1
}]

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
    buildV2DatasetItemPayload({ id: '1' })
  ])
  store.commit('dataset/SET_SELECTED_ITEMS', ['1'])
  jest.spyOn(store, 'dispatch').mockResolvedValue({})

  propsData = {
    dataset,
    positiveClassIds: [],
    negativeClassIds: [],
    disabled: true
  }
})

describe('filtering by class filter', () => {
  it('filters by positive class when class selected', () => {
    const wrapper = shallowMount(V2ClassFilter, { localVue, mocks, propsData, store, stubs })

    emitRootStub(wrapper, 'change', { positiveOptions: [1, 2] })

    expect(nthEmitted(wrapper, 'change', 0)).toEqual([{ positiveOptions: [1, 2] }])

    emitRootStub(wrapper, 'change', { positiveOptions: [] })
    expect(nthEmitted(wrapper, 'change', 1)).toEqual([{ positiveOptions: [] }])
  })

  it('filters by negative class when class selected', () => {
    const wrapper = shallowMount(V2ClassFilter, { localVue, mocks, propsData, store, stubs })

    emitRootStub(wrapper, 'change', { negativeOptions: [1, 2] })

    expect(nthEmitted(wrapper, 'change', 0)).toEqual([{ negativeOptions: [1, 2] }])

    emitRootStub(wrapper, 'change', { negativeOptions: [] })
    expect(nthEmitted(wrapper, 'change', 1)).toEqual([{ negativeOptions: [] }])
  })
})

describe('tagging with class filter', () => {
  it('create a new tag and reload the team', async () => {
    const wrapper = shallowMount(V2ClassFilter, { localVue, mocks, propsData, store, stubs })
    const component = wrapper.vm as unknown as { classFilter: { resetTagInput: Function } }
    component.classFilter = { resetTagInput: (): void => {} }

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

    expect(store.dispatch).toHaveBeenCalledWith('dataset/loadV2DatasetItemCounts', { dataset })
  })

  it('tag selected imagees', async () => {
    const wrapper = shallowMount(V2ClassFilter, { localVue, mocks, propsData, store, stubs })

    await emitRootStub(wrapper, 'tag', options[0])
    expect(store.dispatch).toHaveBeenCalledWith(
      'dataset/tagSelectedItemsV2',
      {
        annotationClassId: 1,
        dataset,
        filters: { item_ids: ['1'] }
      }
    )
  })

  it('tag all selected imagees', async () => {
    store.commit('dataset/SET_SELECTED_ALL_ITEMS', true)
    const wrapper = shallowMount(V2ClassFilter, { localVue, mocks, propsData, store, stubs })

    await emitRootStub(wrapper, 'tag', options[0])
    expect(store.dispatch).toHaveBeenCalledWith(
      'dataset/tagSelectedItemsV2',
      {
        annotationClassId: 1,
        dataset,
        filters: { select_all: true }
      }
    )
  })

  it(`shows storage dialog on ${outOfSubscribedStorageError.code}`, async () => {
    jest.spyOn(store, 'dispatch').mockResolvedValue({ error: outOfSubscribedStorageError })
    const wrapper = shallowMount(V2ClassFilter, { localVue, mocks, propsData, store, stubs })
    await emitRootStub(wrapper, 'tag', options[0])
    await flushPromises()
    expect(store.state.billing.outOfStorageDialogShown).toBe(true)
  })

  it('untag selected imagees, and exclude unnecssary filters', async () => {
    store.commit('dataset/SET_DATASET_ITEMS_FILTER_V2', {
      include_thumbnails: true, include_workflow_data: true
    })
    const wrapper = shallowMount(V2ClassFilter, { localVue, mocks, propsData, store, stubs })

    await emitRootStub(wrapper, 'untag', { id: 1 })
    expect(store.dispatch).toHaveBeenCalledWith(
      'dataset/untagSelectedItemsV2',
      {
        annotationClassId: 1,
        dataset,
        filters: { item_ids: ['1'] }
      }
    )
  })
})
