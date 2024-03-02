import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import { createUnstubbedTestStore } from 'test/unit/createTestStore'
import { buildPresetPayload } from 'test/unit/factories'
import { Mock } from 'test/unit/utils/storageMocks'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createUnstubbedTestStore>

const ACTION = 'workview/loadPresets'
const presets = [buildPresetPayload({ id: 1 })]

beforeEach(() => {
  Object.defineProperty(window, 'localStorage', { value: new Mock() })
  store = createUnstubbedTestStore()
})

it('should return presets from local storage', async () => {
  localStorage.setItem('preset_items', JSON.stringify(presets))
  await store.dispatch(ACTION)
  expect(store.state.workview.presets).toEqual(presets)
})

it('should return empty array if nothing exists in local storage', async () => {
  localStorage.setItem('preset_items', '')
  await store.dispatch(ACTION)
  expect(store.state.workview.presets).toEqual([])
})
