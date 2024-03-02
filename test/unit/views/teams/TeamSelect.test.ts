import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'

import { buildTeamPayload } from 'test/unit/factories'

import team from '@/store/modules/team'
import { getInitialState as getTeamInitialState } from '@/store/modules/team/state'
import { RootState } from '@/store/types'
import TeamSelect from '@/views/teams/TeamSelect.vue'

const localVue = createLocalVue()

localVue.use(Vuex)

const newStore = (state = {}) => {
  const store = new Vuex.Store<RootState>({
    modules: {
      team: { ...team, state: { ...getTeamInitialState, ...state } }
    }
  })
  jest.spyOn(store, 'dispatch').mockResolvedValue({})
  return store
}

it('matches snapshot', () => {
  const teams = [buildTeamPayload({ id: 1, name: 'Team1' }), buildTeamPayload({ id: 2, name: 'Team2' })]
  const store = newStore({ currentTeam: teams[0], teams })
  const wrapper = shallowMount(TeamSelect, { localVue, store })
  expect(wrapper).toMatchSnapshot()
})
