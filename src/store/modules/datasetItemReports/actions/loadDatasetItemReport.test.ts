import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import { createUnstubbedTestStore } from 'test/unit/createTestStore'
import { buildDatasetItemReportPayloadFinished, buildDatasetPayload } from 'test/unit/factories'
import { buildAxiosResponse } from 'test/unit/factories/buildAxiosResponse'
import { buildTeamPayload } from 'test/unit/factories/buildTeamPayload'
import { mockApi } from 'test/unit/mocks/mockApi'

import { DatasetItemReportPayload } from '@/store/modules/datasetItemReports/types'
import { api } from '@/utils'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createUnstubbedTestStore>

const v7 = buildTeamPayload({ id: 1 })
const dataset = buildDatasetPayload({ id: 1 })
let report: DatasetItemReportPayload

const ACTION = 'datasetItemReports/loadDatasetItemReport'

mockApi()

beforeEach(() => {
  report = { ...buildDatasetItemReportPayloadFinished({ id: '1' }) }
  jest.spyOn(api, 'get').mockResolvedValue(
    buildAxiosResponse({ data: report })
  )
  store = createUnstubbedTestStore()

  store.commit('dataset/SET_CURRENT_DATASET_ID', 1)
  store.commit('dataset/SET_DATASETS', [dataset])
  store.commit('team/SET_CURRENT_TEAM', v7)
})

it('sends API request', async () => {
  await store.dispatch(ACTION, { reportId: '1' })
  expect(api.get).toHaveBeenCalledWith('teams/team/dataset/item_reports/1')
})

it('update report in the list', async () => {
  jest.spyOn(api, 'get').mockResolvedValue(
    buildAxiosResponse({ data: report })
  )
  await store.dispatch(ACTION, { reportId: '1' })
  expect(store.state.datasetItemReports.reports).toEqual([report])
})
