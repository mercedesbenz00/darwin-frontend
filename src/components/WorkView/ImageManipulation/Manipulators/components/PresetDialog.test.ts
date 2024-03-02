import { createLocalVue, shallowMount } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import VModal from 'vue-js-modal'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buttonEvents } from 'test/unit/testHelpers'

import { Editor } from '@/engine/editor'
import { ItemManager } from '@/engine/managers'
import { DEFAULT_IMAGE_MANIPULATION_FILTER } from '@/engineCommon/imageManipulation'
import { installCommonComponents } from '@/plugins/components'
import { PresetPayload } from '@/store/types'

import PresetDialog from './PresetDialog.vue'

const localVue = createLocalVue()
localVue.use(VModal)
localVue.use(Vuex)
installCommonComponents(localVue)

let store: ReturnType<typeof createTestStore>
let propsData: {
  editor: Editor
}

const presets: PresetPayload[] = [
  {
    id: 1,
    name: 'Preset 1',
    keys: ['Tab', '1'],
    manipulation: DEFAULT_IMAGE_MANIPULATION_FILTER
  }
]

const models = {
  presetName: 'input-field-stub',
  hotkeyInput: 'hotkey-input-stub',
  saveButton: 'positive-button-stub'
}

beforeEach(() => {
  store = createTestStore()
  store.commit('workview/SET_PRESETS', presets)
  const editor = new Editor(new ItemManager(store), store)
  propsData = { editor }
})

it('matches snapshot', () => {
  const wrapper = shallowMount(PresetDialog, { localVue, propsData, store })
  expect(wrapper).toMatchSnapshot()
})

it('should saved configured preset', async () => {
  const wrapper = shallowMount(PresetDialog, { localVue, propsData, store })
  wrapper.find(models.presetName).vm.$emit('input', 'Preset 2')
  wrapper.find(models.hotkeyInput).vm.$emit('update:hotkey', { keys: ['Tab', '2'] })
  await wrapper.find(models.saveButton).vm.$emit('click', buttonEvents)
  expect(store.dispatch).toHaveBeenCalledWith(
    'workview/savePreset',
    expect.objectContaining({
      id: expect.any(Number),
      name: 'Preset 2',
      keys: ['Tab', '2']
    })
  )
})

it('shows warning if hotkey is duplicated', async () => {
  const wrapper = shallowMount(PresetDialog, { localVue, propsData, store })
  wrapper.find(models.presetName).vm.$emit('input', 'Preset 3')
  wrapper.find(models.hotkeyInput).vm.$emit('update:hotkey', { keys: ['Tab', '1'] })
  await flushPromises()
  expect(store.dispatch).toBeCalledWith('toast/warning',
    { content: 'Will replace Preset 1\'s existing hotkey' })
})

it('overrides the existing one if saved although duplicated', async () => {
  const wrapper = shallowMount(PresetDialog, { localVue, propsData, store })
  wrapper.find(models.presetName).vm.$emit('input', 'Preset 3')
  wrapper.find(models.hotkeyInput).vm.$emit('update:hotkey', { keys: ['Tab', '1'] })
  await wrapper.find(models.saveButton).vm.$emit('click', buttonEvents)
  expect(store.dispatch).toHaveBeenCalledWith(
    'workview/savePreset',
    expect.objectContaining({
      id: expect.any(Number),
      name: 'Preset 1',
      keys: []
    })
  )
  expect(store.dispatch).toHaveBeenCalledWith(
    'workview/savePreset',
    expect.objectContaining({
      id: expect.any(Number),
      name: 'Preset 3',
      keys: ['Tab', '1']
    })
  )
})
