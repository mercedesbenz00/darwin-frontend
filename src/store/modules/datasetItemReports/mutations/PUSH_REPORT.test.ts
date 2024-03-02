import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import { createUnstubbedTestStore } from 'test/unit/createTestStore'
import { buildDatasetItemReportPayloadStarted } from 'test/unit/factories'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createUnstubbedTestStore>

beforeEach(() => {
  store = createUnstubbedTestStore()
})

it('should push report item', () => {
  const report = buildDatasetItemReportPayloadStarted()
  expect(store.state.datasetItemReports.reports).toEqual([])
  store.commit('datasetItemReports/PUSH_REPORT', report)
  expect(store.state.datasetItemReports.reports).toEqual([report])
})
