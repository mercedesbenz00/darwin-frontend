import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'

import {
  buildMembershipPayload,
  buildTeamPayload
} from 'test/unit/factories'

import ReadOnlyUserList from '@/components/Stages/StageChilds/ReadOnlyUserList.vue'
import team, { getInitialState as teamState } from '@/store/modules/team'
import workview, { getInitialState as workviewState } from '@/store/modules/workview'
import { StageType } from '@/store/types'
import { V2AnnotateStagePayload, V2ReviewStagePayload } from '@/store/types/V2WorkflowStagePayload'

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

let propsData: {
  stage: V2AnnotateStagePayload | V2ReviewStagePayload
}
let store: ReturnType<typeof newStore>

beforeEach(() => {
  propsData = {
    stage: {
      assignable_users: [{ user_id: 1 }, { user_id: 2 }],
      config: {
        initial: false,
        readonly: false,
        x: 0,
        y: 0
      },
      edges: [],
      id: 'fake-stage-id',
      name: 'Review',
      type: StageType.Review,
    }
  }
  store = newStore()
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
    }),
    buildMembershipPayload({
      id: 3,
      user_id: 3,
      first_name: 'Ken',
      last_name: 'Annotator ',
      team_id: v7.id
    }),
    buildMembershipPayload({
      id: 4,
      user_id: 4,
      first_name: 'James',
      last_name: 'Annotator ',
      team_id: v7.id
    })
  ]
  
  store.commit('team/SET_MEMBERSHIPS', membershipList)
})

it('matches snapshot', () => {
  const wrapper = shallowMount(ReadOnlyUserList, { localVue, propsData, store })
  expect(wrapper).toMatchSnapshot()
})

it('when there are 2 or less than 2 annotators', () => {
  const wrapper = shallowMount(ReadOnlyUserList, { localVue, propsData, store })
  expect(wrapper).toMatchSnapshot()
  expect(wrapper.find('.sul-content__more').exists()).toBe(false)
})

describe('when there are more than 2 annotators', () => {
  it('when 3 annotators, condense list and displays +1 more annotator', () => {
    propsData.stage.assignable_users.push({ user_id: 3 })
    const wrapper = shallowMount(ReadOnlyUserList, { localVue, propsData, store })
    expect(wrapper).toMatchSnapshot()
    expect(wrapper.find('.sul-content__more').exists()).toBe(true)
    expect(wrapper.find('.sul-content__more').text()).toBe('+1 more annotator')
  })

  it('when more than 3 annotators, condense list and displays more annotators', () => {
    propsData.stage.assignable_users.push({ user_id: 3 })
    propsData.stage.assignable_users.push({ user_id: 4 })
    const wrapper = shallowMount(ReadOnlyUserList, { localVue, propsData, store })
    expect(wrapper).toMatchSnapshot()
    expect(wrapper.find('.sul-content__more').exists()).toBe(true)
    expect(wrapper.find('.sul-content__more').text()).toContain('more annotators')
  })
})
