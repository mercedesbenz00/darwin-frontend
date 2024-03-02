import { createLocalVue } from '@vue/test-utils'
import Vuex, { Store } from 'vuex'

import { buildAxiosResponse, buildTeamPayload } from 'test/unit/factories'
import { mockApi } from 'test/unit/mocks/mockApi'

import features, { getInitialState as featuresState } from '@/store/modules/features'
import team, { getInitialState as teamState } from '@/store/modules/team'
import { RootState, FeaturePayload } from '@/store/types'
import { api } from '@/utils'

mockApi()

const localVue = createLocalVue()
localVue.use(Vuex)

const newStore = (): Store<RootState> => new Vuex.Store<RootState>({
  modules: {
    team: { ...team, state: teamState() },
    features: { ...features, state: featuresState() }
  }
})

let store: ReturnType<typeof newStore>

beforeEach(() => {
  store = newStore()
})

describe('features/getFeatures', () => {
  const feature: FeaturePayload = { name: 'TEST_FEATURE', enabled: false }

  it('fetches team features if current team available', async () => {
    store.commit('team/SET_CURRENT_TEAM', buildTeamPayload({ id: 99 }))
    jest.spyOn(api, 'get').mockResolvedValue(buildAxiosResponse({ data: [feature] }))
    await store.dispatch('features/getFeatures')
    expect(api.get).toHaveBeenCalledWith('teams/99/features')
  })

  it('responds with data', async () => {
    store.commit('team/SET_CURRENT_TEAM', buildTeamPayload({ id: 99 }))
    jest.spyOn(api, 'get').mockResolvedValue(buildAxiosResponse({ data: [feature] }))
    const response = await store.dispatch('features/getFeatures')
    expect(response.data).toEqual([feature])
  })

  it('sets features on store', async () => {
    store.commit('team/SET_CURRENT_TEAM', buildTeamPayload({ id: 99 }))
    jest.spyOn(api, 'get').mockResolvedValue(buildAxiosResponse({ data: [feature] }))
    await store.dispatch('features/getFeatures')
    expect(store.state.features.list).toEqual([feature])
  })

  it('falls back to global features if currentTeam is not defined in team store', async () => {
    jest.spyOn(api, 'get').mockResolvedValue(buildAxiosResponse({ data: [feature] }))
    await store.dispatch('features/getFeatures')
    expect(store.state.features.list).toEqual([feature])
  })
})
