import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import { createUnstubbedTestStore } from 'test/unit/createTestStore'
import { buildPresetPayload } from 'test/unit/factories'
import { Mock } from 'test/unit/utils/storageMocks'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createUnstubbedTestStore>

const ACTION = 'workview/savePreset'
const preset = buildPresetPayload({ id: 1 })

beforeEach(() => {
  Object.defineProperty(window, 'localStorage', { value: new Mock() })
  store = createUnstubbedTestStore()
})

it('should save the preset to local storage', async () => {
  await store.dispatch(ACTION, preset)
  expect(localStorage.getItem('preset_items')).toEqual(JSON.stringify([preset]))
})
