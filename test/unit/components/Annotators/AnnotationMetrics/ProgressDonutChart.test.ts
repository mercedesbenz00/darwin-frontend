import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'

import { createMockTheme } from 'test/unit/components/mocks'
import createTestStore from 'test/unit/createTestStore'
import { buildDatasetPayload, buildDatasetReportPayload } from 'test/unit/factories'

import ProgressDonutChart from '@/components/Annotators/AnnotationMetrics/ProgressDonutChart.vue'
import { DatasetItemStatus, DatasetPayload } from '@/store/types'

const localVue = createLocalVue()
localVue.use(Vuex)

const sfh = buildDatasetPayload({ id: 1, name: 'SFH' })

let store: ReturnType<typeof createTestStore>
let propsData: { dataset: DatasetPayload }
let mocks: { $theme: ReturnType<typeof createMockTheme> }

beforeEach(() => {
  store = createTestStore()
  propsData = { dataset: sfh }
  mocks = { $theme: createMockTheme() }
})

const sfhReport = buildDatasetReportPayload({
  id: sfh.id,
  items_by_status: [
    { status: DatasetItemStatus.uploading, count: 1 },
    { status: DatasetItemStatus.processing, count: 3 },
    { status: DatasetItemStatus.new, count: 5 },
    { status: DatasetItemStatus.annotate, count: 7 },
    { status: DatasetItemStatus.review, count: 9 },
    { status: DatasetItemStatus.complete, count: 11 }
  ]
})

it('matches snapshot on blank stats', () => {
  const wrapper = shallowMount(ProgressDonutChart, { localVue, mocks, propsData, store })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot on loaded stats', async () => {
  const wrapper = shallowMount(ProgressDonutChart, { localVue, mocks, propsData, store })
  store.commit('dataset/PUSH_REPORT', sfhReport)
  await wrapper.vm.$nextTick()
  expect(wrapper).toMatchSnapshot()
})

describe('stats computation', () => {
  it('sets default stats on dataset-stats  ', () => {
    const wrapper = shallowMount(ProgressDonutChart, { localVue, mocks, propsData, store })

    const defaultStats = {
      completedCount: 0,
      inProgressCount: 0,
      newCount: 0,
      totalCount: 0
    }
    expect((wrapper.vm as any).stats).toEqual(defaultStats)
  })

  it('computes dataset report stats  ', async () => {
    const wrapper = shallowMount(ProgressDonutChart, { localVue, mocks, propsData, store })

    store.commit('dataset/PUSH_REPORT', sfhReport)
    await wrapper.vm.$nextTick()

    const expectedStats = {
      completedCount: 11,
      inProgressCount: 16,
      newCount: 9,
      totalCount: 36
    }
    expect((wrapper.vm as any).stats).toEqual(expectedStats)
  })

  it('computes annotation report stats  ', () => {
    const wrapper = shallowMount(ProgressDonutChart, { localVue, mocks, propsData, store })

    const expectedStats = {
      completedCount: 0,
      inProgressCount: 0,
      newCount: 0,
      totalCount: 0
    }
    expect((wrapper.vm as any).stats).toEqual(expectedStats)
  })
})
