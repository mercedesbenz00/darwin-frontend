import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import {
  buildV2DatasetItemTimeSummaryPayload,
  buildMembershipPayload,
  buildV2WorkflowStagePayload,
  buildV2DatasetItemPayload
} from 'test/unit/factories'

import { StageData } from '@/components/WorkView/TopBar/Stages/V2'
import clickOutsideDirective from '@/directives/click-outside'
import {
  V2DatasetItemPayload,
  StageType,
  V2DatasetItemTimeSummaryPayload
} from '@/store/types'
import { formatDurationAsTimer } from '@/utils'

import V2TimeSummary from './V2TimeSummary.vue'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.directive('click-outside', clickOutsideDirective)
localVue.filter('duration', formatDurationAsTimer)

let store: ReturnType<typeof createTestStore>

let propsData: { stageData: StageData, open: boolean }
let summary: V2DatasetItemTimeSummaryPayload
let stageData: StageData
let item: V2DatasetItemPayload

beforeEach(() => {
  store = createTestStore()
  jest.spyOn(store, 'dispatch').mockResolvedValue({})

  stageData = {
    stage: buildV2WorkflowStagePayload({ id: '1', type: StageType.Review }),
    instance: null,
    key: '1'
  }
  summary = buildV2DatasetItemTimeSummaryPayload({
    dataset_item_id: '11',
    current_workflow: {
      per_stage_per_user: [
        { user_id: 1, stage_id: '1', type: StageType.Annotate, duration: 5 },
        { user_id: 2, stage_id: '2', type: StageType.Review, duration: 10 }
      ]

    }
  })
  propsData = {
    stageData,
    open: true
  }
  store.commit('team/SET_MEMBERSHIPS', [
    buildMembershipPayload({ id: 11, user_id: 1, first_name: 'John', last_name: 'Smith' }),
    buildMembershipPayload({ id: 22, user_id: 2, first_name: 'Sam', last_name: 'Annotator' })
  ])

  const mockDispatch = jest.fn().mockImplementation(() => {
    return Promise.resolve({ data: {} })
  })

  store.dispatch = mockDispatch

  item = buildV2DatasetItemPayload({ id: '11' })

  store.commit('dataset/INIT_V2_DATASET_ITEMS', [item.id])
  store.commit('dataset/SET_V2_DATASET_ITEMS', [item])
  store.commit('workview/SET_V2_SELECTED_DATASET_ITEM', item.id)
})

it('matches snapshot when no summary', () => {
  const wrapper = shallowMount(V2TimeSummary, { localVue, propsData, store })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when summary available', () => {
  store.commit('workview/PUSH_V2_TIME_SUMMARY', summary)
  const wrapper = shallowMount(V2TimeSummary, { localVue, propsData, store })
  expect(wrapper).toMatchSnapshot()
  expect(wrapper.findAll('.summary__item')).toHaveLength(1)
})

it('matches snapshot when no time tracked on current stage', () => {
  summary.current_workflow.per_stage_per_user = []
  store.commit('workview/PUSH_V2_TIME_SUMMARY', summary)

  const wrapper = shallowMount(V2TimeSummary, { localVue, propsData, store })
  expect(wrapper).toMatchSnapshot()
})
