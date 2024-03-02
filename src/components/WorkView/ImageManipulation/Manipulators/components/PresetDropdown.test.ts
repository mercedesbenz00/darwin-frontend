import { createLocalVue, shallowMount, Stubs } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { Dropdown } from 'test/unit/stubs'
import { buttonEvents } from 'test/unit/testHelpers'

import { Editor } from '@/engine/editor'
import { ItemManager } from '@/engine/managers'
import { DEFAULT_IMAGE_MANIPULATION_FILTER } from '@/engineCommon/imageManipulation'
import { installCommonComponents } from '@/plugins/components'
import { PresetPayload } from '@/store/types'

import PresetDropdown from './PresetDropdown.vue'

const localVue = createLocalVue()
localVue.use(Vuex)
installCommonComponents(localVue)

let store: ReturnType<typeof createTestStore>
let propsData: {
  editor: Editor,
  value: number | null
}
const stubs: Stubs = { Dropdown }
const mocks = { $modal: { show: jest.fn() } }
const presets: PresetPayload[] = [
  {
    id: 1,
    name: 'Preset 1',
    keys: [],
    manipulation: DEFAULT_IMAGE_MANIPULATION_FILTER
  },
  {
    id: 2,
    name: 'Preset 2',
    keys: [],
    manipulation: DEFAULT_IMAGE_MANIPULATION_FILTER
  }
]

beforeEach(() => {
  store = createTestStore()
  store.commit('workview/SET_PRESETS', presets)
  const editor = new Editor(new ItemManager(store), store)
  propsData = { editor, value: null }
})

it('matches snapshot', () => {
  const wrapper = shallowMount(PresetDropdown, { localVue, mocks, propsData, store, stubs })
  expect(wrapper).toMatchSnapshot()
})

it('should open preset dialog', async () => {
  const wrapper = shallowMount(PresetDropdown, { localVue, mocks, propsData, store, stubs })
  const dialog = wrapper.vm.$refs.presetDialog as any
  dialog.show = jest.fn()
  await wrapper.find('secondary-button-stub').vm.$emit('click', buttonEvents)
  expect(dialog.show).toHaveBeenCalledWith()
})

it('should open delete dialog', async () => {
  const wrapper = shallowMount(PresetDropdown, { localVue, mocks, propsData, store, stubs })
  await wrapper.find('preset-option-stub').vm.$emit('delete')
  expect(mocks.$modal.show).toHaveBeenCalledWith('confirm-delete-preset')
})
