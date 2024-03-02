import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'

import { buildWorkflowStagePayload, buildMembershipPayload, buildTeamPayload } from 'test/unit/factories'

import StageInstance from '@/components/WorkView/Common/StageInstance.vue'
import { StageInstanceWithTimerProps } from '@/components/WorkView/Common/types'
import team, { getInitialState as teamState } from '@/store/modules/team'
import workview, { getInitialState as workviewState } from '@/store/modules/workview'
import { StageType } from '@/store/types'

const localVue = createLocalVue()
localVue.use(Vuex)

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

const v7 = buildTeamPayload({ id: 1 })

let propsData: StageInstanceWithTimerProps
let store: ReturnType<typeof newStore>

beforeEach(() => {
  propsData = {
    instance: buildWorkflowStagePayload({
      id: 22, workflow_stage_template_id: 2, type: StageType.Review
    })
  }
  store = newStore()
  store.commit('team/SET_CURRENT_TEAM', v7)
})

it('matches snapshot with annotate stage', () => {
  propsData.instance = buildWorkflowStagePayload({ type: StageType.Annotate })
  const wrapper = shallowMount(StageInstance, { localVue, propsData, store })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot with review stage', () => {
  propsData.instance = buildWorkflowStagePayload({ type: StageType.Review })
  const wrapper = shallowMount(StageInstance, { localVue, propsData, store })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot with complete stage', () => {
  propsData.instance = buildWorkflowStagePayload({ type: StageType.Complete })
  const wrapper = shallowMount(StageInstance, { localVue, propsData, store })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot with assignee', () => {
  const membership = buildMembershipPayload({
    user_id: 2,
    first_name: 'Sam',
    last_name: 'Annotator ',
    team_id: v7.id
  })
  store.commit('team/SET_MEMBERSHIPS', [membership])

  propsData.instance = buildWorkflowStagePayload({ type: StageType.Annotate, assignee_id: 2 })
  const wrapper = shallowMount(StageInstance, { localVue, propsData, store })
  expect(wrapper).toMatchSnapshot()
  expect(wrapper.find('team-member-avatar-stub').exists()).toBe(true)
})

it('emits on click', () => {
  const wrapper = shallowMount(StageInstance, { localVue, propsData, store })
  wrapper.find('status-button-stub').vm.$emit('click')
  expect(wrapper.emitted().click).toHaveLength(1)
})
