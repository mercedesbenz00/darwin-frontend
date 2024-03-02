import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import { createUnstubbedTestStore } from 'test/unit/createTestStore'

import { leaveChannel } from '@/store/modules/neuralModel/actions/leaveChannel'
import { StoreActionPayload } from '@/store/types'
import { WindSocket as Socket } from '@/utils'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createUnstubbedTestStore>

beforeEach(() => {
  store = createUnstubbedTestStore()
  jest.spyOn(Socket, 'leave').mockResolvedValue('foo' as any)
})

const ACTION = 'neuralModel/leaveChannel'
const payload: StoreActionPayload<typeof leaveChannel> = { topic: 'models:1' }

it('leaves channel', async () => {
  await store.dispatch(ACTION, payload)
  expect(Socket.leave).toHaveBeenCalledWith('models:1')
})
