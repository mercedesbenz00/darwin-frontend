import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'

import {
  buildDatasetItemTimeSummaryPayload,
  buildMembershipPayload,
  buildWorkflowStagePayload
} from 'test/unit/factories'

import TimeSummary from '@/components/WorkView/Common/TimeSummary.vue'
import team, { getInitialState as teamState } from '@/store/modules/team'
import workview, { getInitialState as workviewState } from '@/store/modules/workview'
import { WorkflowStagePayload, StageType, DatasetItemTimeSummaryPayload } from '@/store/types'
import { formatDurationAsTimer } from '@/utils'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.filter('duration', formatDurationAsTimer)

const newStore = () => {
  const store = new Vuex.Store({
    modules: {
      team: { ...team, state: teamState() },
      workview: { ...workview, state: workviewState() }
    }
  })

  jest.spyOn(store, 'dispatch').mockResolvedValue({})
  return store
}

let propsData: { stage: WorkflowStagePayload }
let store: ReturnType<typeof newStore>
let summary: DatasetItemTimeSummaryPayload
let stage: WorkflowStagePayload

beforeEach(() => {
  stage = buildWorkflowStagePayload({ id: 1, dataset_item_id: 11, assignee_id: 1 })
  summary = buildDatasetItemTimeSummaryPayload({
    dataset_item_id: 11,
    current_workflow: {
      per_stage_per_user: [
        { user_id: 1, stage_id: 1, type: StageType.Annotate, duration: 5 },
        { user_id: 2, stage_id: 2, type: StageType.Review, duration: 10 }
      ]

    }
  })
  propsData = {
    stage
  }
  store = newStore()
  store.commit('team/SET_MEMBERSHIPS', [
    buildMembershipPayload({ id: 11, user_id: 1, first_name: 'John', last_name: 'Smith' }),
    buildMembershipPayload({ id: 22, user_id: 2, first_name: 'Sam', last_name: 'Annotator' })
  ])
})

it('matches snapshot when no summary, assigned stage', () => {
  store.commit('workview/PUSH_TIME_SUMMARY', summary)

  const wrapper = shallowMount(TimeSummary, { localVue, propsData, store })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when no summary, unassigned stage', () => {
  propsData.stage.assignee_id = null
  const wrapper = shallowMount(TimeSummary, { localVue, propsData, store })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when summary available, unassigned stage', async () => {
  propsData.stage.assignee_id = null
  const wrapper = shallowMount(TimeSummary, { localVue, propsData, store })
  store.commit('workview/PUSH_TIME_SUMMARY', summary)
  await wrapper.vm.$nextTick()
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when no time tracked on unassigned stage', () => {
  propsData.stage.assignee_id = null
  summary.current_workflow.per_stage_per_user = []
  store.commit('workview/PUSH_TIME_SUMMARY', summary)

  const wrapper = shallowMount(TimeSummary, { localVue, propsData, store })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when no time tracked on assigned stage', () => {
  summary.current_workflow.per_stage_per_user = []
  store.commit('workview/PUSH_TIME_SUMMARY', summary)
  const wrapper = shallowMount(TimeSummary, { localVue, propsData, store })

  expect(wrapper).toMatchSnapshot()
})

it('shows summary for stage assignee even if no time tracked', () => {
  summary.current_workflow.per_stage_per_user = []
  store.commit('workview/PUSH_TIME_SUMMARY', summary)
  const wrapper = shallowMount(TimeSummary, { localVue, propsData, store })

  expect(wrapper.findAll('.summary-item')).toHaveLength(1)
})
