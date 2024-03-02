import { createLocalVue, shallowMount } from '@vue/test-utils'
import VTooltip from 'v-tooltip'
import Vuex from 'vuex'

import { stubDirectiveWithAttribute } from 'test/unit/directiveStubs'
import {
  buildMembershipPayload,
  buildTeamPayload,
  buildV2WorkflowPayload,
  buildV2WorkflowStagePayload
} from 'test/unit/factories'

import ConfigurableUserList from '@/components/Stages/StageChilds/ConfigurableUserList.vue'
import V2Workflow, { getInitialState as V2WorkflowState } from '@/store/modules/V2Workflow'
import team, { getInitialState as teamState } from '@/store/modules/team'
import workview, { getInitialState as workviewState } from '@/store/modules/workview'
import { StageType } from '@/store/types/StageType'
import { V2AnnotateStagePayload, V2ReviewStagePayload } from '@/store/types/V2WorkflowStagePayload'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(VTooltip)
localVue.directive('tooltip', stubDirectiveWithAttribute)

const workflow = buildV2WorkflowPayload({
  stages: [buildV2WorkflowStagePayload({ type: StageType.Review })]
})

const v7 = buildTeamPayload({ id: 1 })

let propsData: { stage: V2AnnotateStagePayload | V2ReviewStagePayload; }

const store = new Vuex.Store({
  modules: {
    team: { ...team, state: teamState() },
    workview: { ...workview, state: workviewState() },
    v2Workflow: { ...V2Workflow, state: V2WorkflowState() }
  }
})

beforeEach(() => {
  jest.spyOn(store, 'dispatch').mockResolvedValue({})

  store.commit('team/SET_CURRENT_TEAM', v7)

  const membershipList = [
    buildMembershipPayload({
      id: 1,
      user_id: 1,
      first_name: 'Jack',
      last_name: 'Annotator ',
      team_id: v7.id
    }),
    buildMembershipPayload({
      id: 2,
      user_id: 2,
      first_name: 'Sam',
      last_name: 'Annotator ',
      team_id: v7.id
    })
  ]

  store.commit('team/SET_MEMBERSHIPS', membershipList)
  propsData = {
    stage: {
      ...workflow.stages[0],
      assignable_users: [{ user_id: 1 }, { user_id: 2 }],
    } as V2ReviewStagePayload
  }

})

it('should match snapshot', () => {
  const wrapper = shallowMount(ConfigurableUserList, {
    propsData,
    localVue,
    store
  })
  expect(wrapper).toMatchSnapshot()
})
