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

it('should replace existing report item', () => {
  const report = buildDatasetItemReportPayloadStarted()
  store.commit('datasetItemReports/SET_REPORTS', [report])
  store.commit('datasetItemReports/SET_REPORT', {
    ...report,
    state: 'finished'
  })
  expect(store.state.datasetItemReports.reports[0].state).toBe('finished')
})
