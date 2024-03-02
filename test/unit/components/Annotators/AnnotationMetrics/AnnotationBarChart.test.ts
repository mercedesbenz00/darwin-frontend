import { shallowMount, createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import { createMockTheme } from 'test/unit/components/mocks'
import createTestStore from 'test/unit/createTestStore'
import {
  buildDatasetAnnotationReportPayload,
  buildMembershipPayload,
  buildDatasetPayload,
  buildTeamPayload,
  buildDatasetAnnotatorPayload
} from 'test/unit/factories'

import AnnotationBarChart from '@/components/Annotators/AnnotationMetrics/AnnotationBarChart.vue'
import { AnnotationDataGranularity, AnnotationDataRange } from '@/components/Annotators/AnnotationMetrics/types'
import { chartFormat } from '@/components/Annotators/AnnotationMetrics/utils'
import { DatasetAnnotationReportPayload, DatasetPayload, MembershipPayload } from '@/store/types'
import { formatRawDate, startOfDay } from '@/utils'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>
let propsData: {
  byUserReport: DatasetAnnotationReportPayload[]
  dataGranularity?: AnnotationDataGranularity
  dataRange: AnnotationDataRange
  dataset: DatasetPayload
  totalReport: DatasetAnnotationReportPayload[]
}

let mocks: {
  $can: (ability?: string) => boolean
  $theme: ReturnType<typeof createMockTheme>
}

const sfh = buildDatasetPayload({ id: 99, name: 'SFH' })

const v7 = buildTeamPayload({ id: 7 })

const memberships = [
  buildMembershipPayload({ id: 1, first_name: 'Sam', last_name: 'A', team_id: v7.id, user_id: 1 }),
  buildMembershipPayload({ id: 2, first_name: 'Jim', last_name: 'A', team_id: v7.id, user_id: 2, role: 'annotator' }),
  buildMembershipPayload({ id: 3, first_name: 'Mike', last_name: 'A', team_id: v7.id, user_id: 3, role: 'annotator' })
]

const [sam, jim, mike] = memberships

const sfhAnnotators = [
  buildDatasetAnnotatorPayload({ id: 2, user_id: jim.user_id, dataset_id: sfh.id })
]

beforeEach(() => {
  store = createTestStore()
  store.commit('team/SET_CURRENT_TEAM', v7)
  store.commit('team/SET_MEMBERSHIPS', memberships)
  store.commit('dataset/PUSH_ANNOTATORS_FOR_DATASET', { datasetId: sfh.id, data: sfhAnnotators })
  propsData = {
    byUserReport: [],
    dataRange: 'total',
    dataset: sfh,
    totalReport: []
  }
  mocks = {
    $can: () => true,
    $theme: createMockTheme()
  }
})

it('matches snapshot with blank data', () => {
  const wrapper = shallowMount(AnnotationBarChart, { localVue, mocks, propsData, store })
  expect(wrapper).toMatchSnapshot()
})

const today = formatRawDate(startOfDay(), chartFormat('day'))

const samReports = [
  buildDatasetAnnotationReportPayload({ user_id: sam.user_id, images_approved: 50, date: today }),
  buildDatasetAnnotationReportPayload({ user_id: sam.user_id, images_rejected: 5, date: today })
]

const jimReports = [
  buildDatasetAnnotationReportPayload({ user_id: jim.user_id, date: today }),
  buildDatasetAnnotationReportPayload({ user_id: jim.user_id, date: today })
]

const mikeReports = [
  buildDatasetAnnotationReportPayload({ user_id: mike.user_id, date: today }),
  buildDatasetAnnotationReportPayload({ user_id: mike.user_id, date: today })
]

const totalReport = [
  buildDatasetAnnotationReportPayload({ user_id: undefined })
]

it('matches snapshot with data', () => {
  propsData.byUserReport = samReports.concat(jimReports).concat(mikeReports)
  propsData.totalReport = totalReport
  propsData.dataGranularity = 'day'
  const wrapper = shallowMount(AnnotationBarChart, { localVue, mocks, propsData, store })
  expect(wrapper).toMatchSnapshot()
})

it('only shows members which are annotators or have annotated', () => {
  propsData.byUserReport = samReports.concat(jimReports).concat(mikeReports)
  propsData.totalReport = totalReport
  propsData.dataGranularity = 'day'
  const wrapper = shallowMount(AnnotationBarChart, { localVue, mocks, propsData, store })
  const toggles = wrapper.findAll('member-toggle-stub')
  expect(toggles.length).toBe(2)
  const visibleIds = toggles.wrappers
    .map(w => w.props('member'))
    .map((m: MembershipPayload) => m.id)
  expect(visibleIds).toEqual([sam.id, jim.id])
})

it('if annotators, only shows own data and total', () => {
  mocks.$can = () => false
  store.commit('user/SET_PROFILE', { id: sam.user_id })
  propsData.byUserReport = samReports.concat(jimReports).concat(mikeReports)
  propsData.totalReport = totalReport
  propsData.dataGranularity = 'day'
  const wrapper = shallowMount(AnnotationBarChart, { localVue, mocks, propsData, store })
  const toggles = wrapper.findAll('member-toggle-stub')
  expect(toggles.length).toBe(1)
  const visibleIds = toggles.wrappers
    .map(w => w.props('member'))
    .map((m: MembershipPayload) => m.id)
  expect(visibleIds).toEqual([sam.id])
})
