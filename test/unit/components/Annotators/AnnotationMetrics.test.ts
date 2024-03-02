import { shallowMount, createLocalVue } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import moment from 'moment'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buildDatasetAnnotationReportPayload, buildDatasetPayload } from 'test/unit/factories'

import AnnotationMetrics from '@/components/Annotators/AnnotationMetrics.vue'
import { DatasetAnnotationReportPayload } from '@/store/types'

const localVue = createLocalVue()
localVue.use(Vuex)

const sfh = buildDatasetPayload({ id: 1, name: 'SFH' })

const sfhAnnotationReport: DatasetAnnotationReportPayload[] = [
  buildDatasetAnnotationReportPayload({
    annotation_time: 10,
    annotations_created: 5,
    annotations_approved: 3
  }),
  buildDatasetAnnotationReportPayload({
    annotation_time: 5,
    annotations_created: 10,
    annotations_approved: 3
  })
]

let store: ReturnType<typeof createTestStore>
let defaultFrom: string
beforeEach(() => {
  // moment.utc is used within the component,
  // so we need to make sure it's stubbed to a fixed value
  const fakeNow = moment.utc('2020-02-01T00:00:00')
  jest.spyOn(moment, 'utc').mockReturnValue(fakeNow)
  defaultFrom = '2019-12-01T00:00:00.000000'
  store = createTestStore()
})

it('matches snapshot', () => {
  const propsData = { dataset: sfh }
  const wrapper = shallowMount(AnnotationMetrics, { localVue, propsData, store })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when loaded', () => {
  store.commit('annotators/PUSH_ANNOTATION_REPORT', {
    params: { datasetId: sfh.id, granularity: 'day', groupBy: 'dataset,user', from: defaultFrom },
    data: sfhAnnotationReport
  })

  store.commit('annotators/PUSH_ANNOTATION_REPORT', {
    params: { datasetId: sfh.id, granularity: 'day', groupBy: 'dataset', from: defaultFrom },
    data: sfhAnnotationReport
  })
  const propsData = { dataset: sfh }
  const wrapper = shallowMount(AnnotationMetrics, { localVue, propsData, store })
  expect(wrapper).toMatchSnapshot()
})

describe('report download', () => {
  it('downloads report with correct params', () => {
    const propsData = { dataset: sfh }
    const wrapper = shallowMount(AnnotationMetrics, { localVue, propsData, store })

    const dispatch = store.dispatch as jest.Mock
    dispatch.mockClear()

    wrapper.find('download-button-stub').vm.$emit('click')
    expect(dispatch).toHaveBeenCalledWith('annotators/downloadAnnotationReport', { dataset: sfh, granularity: 'day' })
    dispatch.mockClear()

    wrapper.setData({ dataRange: 'month' })
    wrapper.find('download-button-stub').vm.$emit('click')
    expect(dispatch).toHaveBeenCalledWith('annotators/downloadAnnotationReport', { dataset: sfh, granularity: 'day' })
    dispatch.mockClear()

    wrapper.setData({ dataRange: 'week' })
    wrapper.find('download-button-stub').vm.$emit('click')
    expect(dispatch).toHaveBeenCalledWith('annotators/downloadAnnotationReport', { dataset: sfh, granularity: 'hour' })
    dispatch.mockClear()

    wrapper.setData({ dataRange: 'day' })
    wrapper.find('download-button-stub').vm.$emit('click')
    expect(dispatch).toHaveBeenCalledWith('annotators/downloadAnnotationReport', { dataset: sfh, granularity: 'hour' })
  })

  it('shows toast error on download failure', async () => {
    jest.spyOn(store, 'dispatch').mockResolvedValue({ error: { message: 'Fake error' } })
    const propsData = { dataset: sfh }
    const wrapper = shallowMount(AnnotationMetrics, { localVue, propsData, store })

    wrapper.find('download-button-stub').vm.$emit('click')

    await flushPromises()
    expect(store.dispatch).toHaveBeenCalledWith('toast/warning', { content: 'Fake error' })
  })
})
