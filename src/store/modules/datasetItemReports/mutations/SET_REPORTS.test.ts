import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import { createUnstubbedTestStore } from 'test/unit/createTestStore'
import { buildDatasetItemReportPayloadStarted, buildDatasetItemReportPayloadFinished } from 'test/unit/factories'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createUnstubbedTestStore>

beforeEach(() => {
  store = createUnstubbedTestStore()
})

it('should set reports array', () => {
  const reports = [
    buildDatasetItemReportPayloadStarted(),
    buildDatasetItemReportPayloadFinished(),
    buildDatasetItemReportPayloadFinished()
  ]
  store.commit('datasetItemReports/SET_REPORTS', reports)
  expect(store.state.datasetItemReports.reports).toEqual(reports)
})
