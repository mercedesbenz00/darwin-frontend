import { createLocalVue, shallowMount, Stubs } from '@vue/test-utils'
import VModal from 'vue-js-modal'
import Vuex from 'vuex'

import { createMockTheme } from 'test/unit/components/mocks'
import createTestStore from 'test/unit/createTestStore'

import ConfirmationDialogLayout from '@/components/Common/ConfirmationDialogLayout.vue'
import OutOfStorageDialog from '@/components/Plans/Product/OutOfStorageDialog.vue'
import { installCommonComponents } from '@/plugins/components'

let mocks: {
  $route: { name: string, params: Object, query: Object },
  $theme: ReturnType<typeof createMockTheme>
}

const localVue = createLocalVue()
localVue.use(VModal)
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>

installCommonComponents(localVue)

// custom stub defining a prop, so we can assert on the value
const PrimaryButton = localVue.extend({
  props: ['to'],
  template: '<a class="primary-button"><slot/></a>'
})

let stubs: Stubs

beforeEach(() => {
  store = createTestStore()
  mocks = {
    $route: {
      name: 'Datasets',
      params: {},
      query: {}
    },
    $theme: createMockTheme()
  }

  stubs = {
    // unstub the layout, so it's visible which slots were used
    // more reliable than a custom stub with custom slots
    ConfirmationDialogLayout
  }
})

describe('on datasets', () => {
  beforeEach(() => {
    mocks.$route.name = 'Datasets'
  })

  it('matches snapshot', () => {
    const wrapper = shallowMount(OutOfStorageDialog, { localVue, mocks, store, stubs })
    expect(wrapper).toMatchSnapshot()
  })

  it('assigns correct route', () => {
    stubs = { ...stubs, PrimaryButton }
    const wrapper = shallowMount(OutOfStorageDialog, { localVue, mocks, store, stubs })
    expect(wrapper.find('a.primary-button').props('to')).toEqual({
      name: 'Datasets',
      params: {},
      query: { settings: 'plans' }
    })
  })
})

describe('on Workflow', () => {
  beforeEach(() => {
    mocks.$route.name = 'Workflow'
  })

  it('matches snapshot', () => {
    const wrapper = shallowMount(OutOfStorageDialog, { localVue, mocks, store, stubs })
    expect(wrapper).toMatchSnapshot()
  })

  it('assigns correct route', () => {
    stubs = { ...stubs, PrimaryButton }
    const wrapper = shallowMount(OutOfStorageDialog, { localVue, mocks, store, stubs })
    expect(wrapper.find('a.primary-button').props('to')).toEqual({
      name: 'DatasetsIndex',
      query: { settings: 'plans' }
    })
  })
})

it('toggles visibility on and off on flag change', async () => {
  const wrapper = shallowMount(OutOfStorageDialog, { localVue, mocks, store, stubs })
  const show = jest.spyOn(wrapper.vm.$modal, 'show')
  const hide = jest.spyOn(wrapper.vm.$modal, 'hide')

  expect(show).not.toHaveBeenCalled()
  expect(hide).not.toHaveBeenCalled()

  store.commit('billing/SHOW_OUT_OF_STORAGE_DIALOG')
  await wrapper.vm.$nextTick()

  expect(show).toHaveBeenCalledTimes(1)
  expect(hide).not.toHaveBeenCalled()

  store.commit('billing/HIDE_OUT_OF_STORAGE_DIALOG')
  await wrapper.vm.$nextTick()

  expect(show).toHaveBeenCalledTimes(1)
  expect(hide).toHaveBeenCalledTimes(1)
})
