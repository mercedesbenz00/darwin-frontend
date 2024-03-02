import { createLocalVue, shallowMount } from '@vue/test-utils'
import VModal from 'vue-js-modal'
import Vuex from 'vuex'

import { createMockTheme } from 'test/unit/components/mocks'
import createTestStore from 'test/unit/createTestStore'
import { stubDirectiveWithAttribute } from 'test/unit/directiveStubs'
import { ConfirmationDialogLayout } from 'test/unit/stubs'
import { buttonEvents, emitRootStub } from 'test/unit/testHelpers'

import { DeleteConfirmationDialog } from '@/components/Common/DeleteConfirmationDialog/V2'
import { installCommonComponents } from '@/plugins/components'

const localVue = createLocalVue()
localVue.use(VModal)
localVue.use(Vuex)
localVue.directive('loading', stubDirectiveWithAttribute)
installCommonComponents(localVue)

const mocks = { $theme: createMockTheme() }
const stubs = { ConfirmationDialogLayout }

let propsData: {
  title: string
  detail: string
  buttonText: string
  name?: string
  loading?: boolean
}

const itMatchesSnapshot = () => it('matches snapshot', () => {
  const wrapper = shallowMount(DeleteConfirmationDialog, { localVue, mocks, propsData, stubs })
  expect(wrapper).toMatchSnapshot()
})

describe('with normal props', () => {
  beforeEach(() => {
    propsData = { name: 'test-dialog', title: 'Test', detail: 'Test content', buttonText: 'DELETE' }
  })

  itMatchesSnapshot()
})

describe('when loading', () => {
  beforeEach(() => {
    propsData = { title: 'Test', detail: 'Test content', buttonText: 'DELETE', loading: true }
  })

  itMatchesSnapshot()
})

describe('show/hide', () => {
  propsData = { name: 'test-dialog', title: 'Test', detail: 'Test content', buttonText: 'DELETE' }
  let store: ReturnType<typeof createTestStore>

  beforeEach(() => {
    store = createTestStore()
  })

  it('toggles UI', async () => {
    const wrapper = shallowMount(DeleteConfirmationDialog, { localVue, mocks, propsData, store, stubs })
    await emitRootStub(wrapper, 'before-open')
    expect(store.dispatch).toHaveBeenCalledWith('ui/putBackSidebar')
  })

  it('passes data on confirm', async () => {
    const wrapper = shallowMount(DeleteConfirmationDialog, { localVue, mocks, propsData, store, stubs })
    const component = wrapper.vm as any
    component.show()
    await wrapper.vm.$nextTick()
    await wrapper.find('custom-button-stub.btn-negative').vm.$emit('click', buttonEvents)
    expect(wrapper.emitted().confirmed).toHaveLength(1)
  })

  it('toggles UI on close', async () => {
    const wrapper = shallowMount(DeleteConfirmationDialog, { localVue, mocks, propsData, store, stubs })
    await emitRootStub(wrapper, 'closed')
    expect(store.dispatch).toHaveBeenCalledWith('ui/bringFrontSidebar')
  })
})
