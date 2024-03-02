import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buildV2DARCWorkflow } from 'test/unit/factories'

import { StageType, V2DatasetStagePayload } from '@/store/types'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>

const GETTER = 'v2Workflow/getWorkflowByDatasetId'

const workflow1 = buildV2DARCWorkflow()
const stage1 = workflow1.stages.find(s => s.type === StageType.Dataset) as V2DatasetStagePayload
stage1.config.dataset_id = 1

beforeEach(() => {
  store = createTestStore()
  store.commit('v2Workflow/SET_WORKFLOWS', [workflow1])
})

it('returns workflow associated to specified dataset id or null', () => {
  expect(store.getters[GETTER](1)).toBe(workflow1)
  expect(store.getters[GETTER](3)).toBe(null)
})
