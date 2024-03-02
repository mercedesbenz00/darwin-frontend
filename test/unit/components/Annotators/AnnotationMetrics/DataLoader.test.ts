import { shallowMount, createLocalVue } from '@vue/test-utils'
import moment from 'moment'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buildDatasetPayload } from 'test/unit/factories'

import DataLoader from '@/components/Annotators/AnnotationMetrics/DataLoader'
import { AnnotationDataRange } from '@/components/Annotators/AnnotationMetrics/types'
import { DatasetPayload } from '@/store/types'

const localVue = createLocalVue()
localVue.use(Vuex)

const sfh = buildDatasetPayload({ id: 1, name: 'SFH' })

let store: ReturnType<typeof createTestStore>
let propsData: {
  dataset: DatasetPayload
  dataRange: AnnotationDataRange
}
let mocks: { $can: (ability?: string) => boolean }

beforeEach(() => {
  store = createTestStore()
  propsData = {
    dataset: sfh,
    dataRange: 'month'
  }
  mocks = {
    $can: () => true
  }
})

it('fetches dataset annotators on mount', () => {
  shallowMount(DataLoader, { localVue, mocks, propsData, store })
  expect(store.dispatch).toHaveBeenCalledWith('dataset/getAnnotators', { datasetId: sfh.id })
})

it('does not fetch annotators if current user is annotator', () => {
  mocks.$can = () => false
  shallowMount(DataLoader, { localVue, mocks, propsData, store })
  expect(store.dispatch).not.toHaveBeenCalledWith('dataset/getAnnotators', { datasetId: sfh.id })
})

it('fetches dataset report on mount', () => {
  shallowMount(DataLoader, { localVue, mocks, propsData, store })
  expect(store.dispatch).toHaveBeenCalledWith('annotators/loadDatasetReport', sfh)
})

it('fetches total annotation report', async () => {
  const format = 'YYYY-MM-DDTHH:00:00.000000'
  const monthAgo = moment.utc().subtract(1, 'month').startOf('hour').format(format)
  const weekAgo = moment.utc().subtract(1, 'week').startOf('hour').format(format)
  const dayAgo = moment.utc().subtract(1, 'day').startOf('hour').format(format)

  const wrapper = shallowMount(DataLoader, { localVue, mocks, propsData, store })

  const dispatch = store.dispatch as jest.Mock

  expect(dispatch).toHaveBeenCalledWith('annotators/getAnnotationReport', {
    dataset: sfh,
    from: monthAgo,
    granularity: 'day',
    groupBy: 'dataset'
  })

  await wrapper.setProps({ dataRange: 'total' })
  expect(dispatch).toHaveBeenCalledWith('annotators/getAnnotationReport', {
    dataset: sfh,
    from: null,
    granularity: 'day',
    groupBy: 'dataset'
  })
  dispatch.mockClear()

  await wrapper.setProps({ dataRange: 'month' })
  expect(dispatch).toHaveBeenCalledWith('annotators/getAnnotationReport', {
    dataset: sfh,
    from: monthAgo,
    granularity: 'day',
    groupBy: 'dataset'
  })
  dispatch.mockClear()

  await wrapper.setProps({ dataRange: 'week' })
  expect(dispatch).toHaveBeenCalledWith('annotators/getAnnotationReport', {
    dataset: sfh,
    from: weekAgo,
    granularity: 'hour',
    groupBy: 'dataset'
  })
  dispatch.mockClear()

  await wrapper.setProps({ dataRange: 'day' })
  expect(dispatch).toHaveBeenCalledWith('annotators/getAnnotationReport', {
    dataset: sfh,
    from: dayAgo,
    granularity: 'hour',
    groupBy: 'dataset'
  })
  dispatch.mockClear()
})

it('fetches by user annotation report', async () => {
  const format = 'YYYY-MM-DDTHH:00:00.000000'
  const monthAgo = moment.utc().subtract(1, 'month').startOf('hour').format(format)
  const weekAgo = moment.utc().subtract(1, 'week').startOf('hour').format(format)
  const dayAgo = moment.utc().subtract(1, 'day').startOf('hour').format(format)

  const wrapper = shallowMount(DataLoader, { localVue, mocks, propsData, store })

  const dispatch = store.dispatch as jest.Mock

  expect(dispatch).toHaveBeenCalledWith('annotators/getAnnotationReport', {
    dataset: sfh,
    from: monthAgo,
    granularity: 'day',
    groupBy: 'dataset,user'
  })
  dispatch.mockClear()

  await wrapper.setProps({ dataRange: 'total' })
  expect(dispatch).toHaveBeenCalledWith('annotators/getAnnotationReport', {
    dataset: sfh,
    from: null,
    granularity: 'day',
    groupBy: 'dataset,user'
  })
  dispatch.mockClear()

  await wrapper.setProps({ dataRange: 'month' })
  expect(dispatch).toHaveBeenCalledWith('annotators/getAnnotationReport', {
    dataset: sfh,
    from: monthAgo,
    granularity: 'day',
    groupBy: 'dataset,user'
  })
  dispatch.mockClear()

  await wrapper.setProps({ dataRange: 'week' })
  expect(dispatch).toHaveBeenCalledWith('annotators/getAnnotationReport', {
    dataset: sfh,
    from: weekAgo,
    granularity: 'hour',
    groupBy: 'dataset,user'
  })
  dispatch.mockClear()

  await wrapper.setProps({ dataRange: 'day' })
  expect(dispatch).toHaveBeenCalledWith('annotators/getAnnotationReport', {
    dataset: sfh,
    from: dayAgo,
    granularity: 'hour',
    groupBy: 'dataset,user'
  })
  dispatch.mockClear()
})
