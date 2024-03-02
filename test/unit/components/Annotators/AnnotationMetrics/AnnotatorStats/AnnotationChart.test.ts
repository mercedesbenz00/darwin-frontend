import { shallowMount, createLocalVue } from '@vue/test-utils'

import { createMockTheme } from 'test/unit/components/mocks'
import {
  buildDatasetAnnotationReportPayload,
  buildMembershipPayload
} from 'test/unit/factories'

import AnnotationChart from '@/components/Annotators/AnnotationMetrics/AnnotatorStats/AnnotationChart.vue'
import { AnnotationDataGranularity, AnnotationChartData, ChartDimension } from '@/components/Annotators/AnnotationMetrics/types'
import { adaptReportData, getDimensionsData } from '@/components/Annotators/AnnotationMetrics/utils'

const localVue = createLocalVue()
localVue.directive('tooltip', () => {})

let propsData: {
  annotationData: AnnotationChartData[]
  dimension: ChartDimension
  dataGranularity: AnnotationDataGranularity
}

let mocks: { $theme: ReturnType<typeof createMockTheme> }

beforeEach(() => {
  propsData = {
    annotationData: [],
    dataGranularity: 'day',
    dimension: 'annotationTime'
  }
  mocks = { $theme: createMockTheme() }
})

it('matches snapshot with blank data', () => {
  const wrapper = shallowMount(AnnotationChart, { localVue, mocks, propsData })
  expect(wrapper).toMatchSnapshot()
})

const sam = buildMembershipPayload({ id: 1, first_name: 'Sam', last_name: 'Annotator' })

const jim = buildMembershipPayload({ id: 2, first_name: 'Jim', last_name: 'Annotator' })

const mike = buildMembershipPayload({ id: 3, first_name: 'Mike', last_name: 'Annotator' })

const samReports = [
  buildDatasetAnnotationReportPayload({ user_id: sam.id }),
  buildDatasetAnnotationReportPayload({ user_id: sam.id })
]
const samAdapted = samReports.map(adaptReportData)
const samData: AnnotationChartData = {
  data: samAdapted,
  dimensions: getDimensionsData(samAdapted),
  member: sam,
  visible: true
}

const jimReports = [
  buildDatasetAnnotationReportPayload({ user_id: jim.id }),
  buildDatasetAnnotationReportPayload({ user_id: jim.id })
]
const jimAdapted = jimReports.map(adaptReportData)
const jimData: AnnotationChartData = {
  data: jimAdapted,
  dimensions: getDimensionsData(jimAdapted),
  member: jim,
  visible: true
}

const mikeReports = [
  buildDatasetAnnotationReportPayload({ user_id: jim.id }),
  buildDatasetAnnotationReportPayload({ user_id: jim.id })
]
const mikeAdapted = mikeReports.map(adaptReportData)
const mikeData: AnnotationChartData = {
  data: mikeAdapted,
  dimensions: getDimensionsData(mikeAdapted),
  member: mike,
  visible: true
}

it('matches snapshot with data', () => {
  propsData.annotationData = [samData, jimData, mikeData]
  propsData.dimension = 'annotationTime'
  propsData.dataGranularity = 'day'
  const wrapper = shallowMount(AnnotationChart, { localVue, mocks, propsData })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when slot provided', () => {
  propsData.annotationData = [samData, jimData, mikeData]
  propsData.dataGranularity = 'day'
  propsData.dimension = 'annotationTime'
  const slots = { default: '<div>Default slot</div>' }

  const wrapper = shallowMount(AnnotationChart, { localVue, mocks, propsData, slots })
  expect(wrapper).toMatchSnapshot()
})
