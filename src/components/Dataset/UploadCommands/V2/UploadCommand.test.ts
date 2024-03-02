import { createLocalVue, shallowMount } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'

import UploadCommand from '@/components/Dataset/UploadCommands/UploadCommand.vue'
import * as clipboard from '@/utils/clipboard'

jest.mock('@/utils/clipboard')

const localVue = createLocalVue()
localVue.use(Vuex)

const testCommand = { command: 'upload test command', label: 'Test Command' }

let store: ReturnType<typeof createTestStore>

beforeEach(() => { store = createTestStore() })

it('matches snapshot', () => {
  const propsData = { data: testCommand }
  const wrapper = shallowMount(UploadCommand, { localVue, propsData, store })
  expect(wrapper).toMatchSnapshot()
})

it('copies to the clipboard on click', async () => {
  const propsData = { data: testCommand }
  const wrapper = shallowMount(UploadCommand, { localVue, propsData, store })
  wrapper.find('.upload-command__command').trigger('click')
  jest.spyOn(clipboard, 'copy').mockResolvedValue({})
  expect(clipboard.copy).toHaveBeenCalledWith(testCommand.command)
  await flushPromises()
  expect(store.dispatch).toBeCalledWith('toast/notify', { content: 'Command copied to clipboard' })
})
