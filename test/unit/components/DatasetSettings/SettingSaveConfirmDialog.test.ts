import { createLocalVue, shallowMount, Stubs } from '@vue/test-utils'
import VModal from 'vue-js-modal'
import Vuex from 'vuex'

import { createMockTheme } from 'test/unit/components/mocks'
import createTestStore from 'test/unit/createTestStore'
import { stubDirectiveWithAttribute } from 'test/unit/directiveStubs'
import { ConfirmationDialogLayout } from 'test/unit/stubs'
import { emitRootStub } from 'test/unit/testHelpers'

import SettingsSaveConfirmDialog from '@/components/DatasetSettings/SettingsSaveConfirmDialog.vue'
import { installCommonComponents } from '@/plugins/components'

const localVue = createLocalVue()
localVue.use(VModal)
localVue.use(Vuex)
localVue.directive('loading', stubDirectiveWithAttribute)

const mocks = { $theme: createMockTheme() }
installCommonComponents(localVue)
const stubs: Stubs = { ConfirmationDialogLayout }

let propsData: {
  loading: boolean
}

const itMatchesSnapshot = () => it('matches snapshot', () => {
  const wrapper = shallowMount(SettingsSaveConfirmDialog, { localVue, mocks, propsData, stubs })
  expect(wrapper).toMatchSnapshot()
})

describe('with normal props', () => {
  beforeEach(() => {
    propsData = { loading: false }
  })

  itMatchesSnapshot()
})

describe('when loading', () => {
  beforeEach(() => {
    propsData = { loading: true }
  })

  itMatchesSnapshot()
})

describe('show/hide', () => {
  propsData = { loading: false }
  let store: ReturnType<typeof createTestStore>

  beforeEach(() => {
    store = createTestStore()
  })

  it('toggles UI', async () => {
    const wrapper = shallowMount(SettingsSaveConfirmDialog, { localVue, mocks, propsData, store, stubs })
    await emitRootStub(wrapper, 'before-open')
    expect(store.dispatch).toHaveBeenCalledWith('ui/putBackSidebar')
  })

  it('emits discard on discard button click', async () => {
    const wrapper = shallowMount(SettingsSaveConfirmDialog, { localVue, mocks, propsData, store, stubs })
    const component = wrapper.vm as any
    component.$modal.show('settings-save-confirm')
    await wrapper.vm.$nextTick()
    await wrapper.find('secondary-button-stub').vm.$emit('click')
    expect(wrapper.emitted().discard).toHaveLength(1)
  })

  it('emits save on save button click', async () => {
    const wrapper = shallowMount(SettingsSaveConfirmDialog, { localVue, mocks, propsData, store, stubs })
    const component = wrapper.vm as any
    component.$modal.show('settings-save-confirm')
    await wrapper.vm.$nextTick()
    await wrapper.find('positive-button-stub').vm.$emit('click')
    expect(wrapper.emitted().save).toHaveLength(1)
  })

  it('toggles UI on close', async () => {
    const wrapper = shallowMount(SettingsSaveConfirmDialog, { localVue, mocks, propsData, store, stubs })
    await emitRootStub(wrapper, 'closed')
    expect(store.dispatch).toHaveBeenCalledWith('ui/bringFrontSidebar')
  })
})
