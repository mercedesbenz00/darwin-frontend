import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'

import { LoadingStatus } from '@/store/types'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>

beforeEach(() => { store = createTestStore() })

describe('SET_ACTION_LOADING_STATUS', () => {
  it('sets the loadingStatus', async () => {
    store.commit('loading/SET_ACTION_LOADING_STATUS', {
      key: 'actionName',
      status: LoadingStatus.Loading
    })
    await expect(store.state.loading.loadingStatus.actionName).toEqual(LoadingStatus.Loading)
  })
})
