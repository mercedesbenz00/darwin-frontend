import { createLocalVue, shallowMount, Stubs, Wrapper } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { stubDirectiveWithAttribute } from 'test/unit/directiveStubs'
import { buildDatasetPayload } from 'test/unit/factories'
import { VPopover } from 'test/unit/stubs'
import { emitRootStub, triggerRootStub } from 'test/unit/testHelpers'

import { MoreWork } from '@/components/WorkView/BottomBar'
import { installCommonComponents } from '@/plugins/components'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.directive('tooltip', stubDirectiveWithAttribute)
installCommonComponents(localVue)

let store: ReturnType<typeof createTestStore>
const stubs: Stubs = { VPopover }

const workToDo = {
  item_count: 3,
  status_counts: [
    { count: 0, status: 'archived' },
    { count: 0, status: 'error' },
    { count: 0, status: 'uploading' },
    { count: 0, status: 'processing' },
    { count: 0, status: 'new' },
    { count: 1, status: 'annotate' },
    { count: 2, status: 'review' },
    { count: 0, status: 'complete' }
  ]
}

const noWorkToDo = {
  item_count: 3,
  status_counts: [
    { count: 0, status: 'archived' },
    { count: 0, status: 'error' },
    { count: 0, status: 'uploading' },
    { count: 0, status: 'processing' },
    { count: 0, status: 'new' },
    { count: 0, status: 'annotate' },
    { count: 3, status: 'review' },
    { count: 0, status: 'complete' }
  ]
}

beforeEach(() => {
  store = createTestStore()
})

describe('when there is no count information loaded yet', () => {
  beforeEach(() => {
    store.commit('workview/SET_DATASET_ITEM_COUNTS', null)
  })

  it('matches snapshot', () => {
    const wrapper = shallowMount(MoreWork, { localVue, store, stubs })
    expect(wrapper).toMatchSnapshot()
  })

  it('disable button', () => {
    const wrapper = shallowMount(MoreWork, { localVue, store, stubs })
    const button = wrapper.find('custom-button-stub')
    expect(button.attributes('disabled')).toBeTruthy()
  })
})

describe('when there is no work', () => {
  beforeEach(() => {
    store.commit('workview/SET_DATASET_ITEM_COUNTS', noWorkToDo)
  })

  it('matches snapshot', () => {
    const wrapper = shallowMount(MoreWork, { localVue, store, stubs })
    expect(wrapper).toMatchSnapshot()
  })

  it('dispatches action on click', async () => {
    const dataset = buildDatasetPayload({ id: 99 })
    store.commit('workview/SET_DATASET', dataset)
    const wrapper = shallowMount(MoreWork, { localVue, store, stubs })
    await emitRootStub(wrapper, 'click')
    expect(store.dispatch).toHaveBeenCalledWith('workview/requestWork', dataset)
  })

  it('does not disable button', () => {
    const wrapper = shallowMount(MoreWork, { localVue, store, stubs })
    const button = wrapper.find('custom-button-stub')
    expect(button.attributes('disabled')).toBeFalsy()
  })
})

describe('when there is work', () => {
  beforeEach(() => {
    store.commit('workview/SET_DATASET_ITEM_COUNTS', workToDo)
  })

  it('matches snapshot', () => {
    const wrapper = shallowMount(MoreWork, { localVue, store, stubs })
    expect(wrapper).toMatchSnapshot()
  })

  it('disables button', () => {
    const wrapper = shallowMount(MoreWork, { localVue, store, stubs })
    const button = wrapper.find('custom-button-stub')
    expect(button.attributes('disabled')).toBeTruthy()
  })
})

describe('when loading more work', () => {
  beforeEach(() => {
    store.commit('workview/SET_DATASET_ITEM_COUNTS', workToDo)
  })

  let wrapper: Wrapper<Vue>

  beforeEach(() => {
    wrapper = shallowMount(MoreWork, { localVue, store, stubs })
    wrapper.setData({ loading: true })
  })

  it('matches snapshot', () => {
    expect(wrapper).toMatchSnapshot()
  })

  it('dispatches no action on click', async () => {
    const dataset = buildDatasetPayload({ id: 99 })
    store.commit('workview/SET_DATASET', dataset)
    await triggerRootStub(wrapper, 'click')
    expect(store.dispatch).not.toHaveBeenCalledWith('workview/requestWork', dataset)
  })

  it('disables button', async () => {
    const wrapper = shallowMount(MoreWork, { localVue, store, stubs })
    const button = wrapper.find('custom-button-stub')
    await button.vm.$emit('click')
    expect(button.attributes('disabled')).toBeTruthy()
  })
})

describe('after loading more work', () => {
  beforeEach(() => {
    store.commit('workview/SET_DATASET_ITEM_COUNTS', workToDo)
  })

  it('notifies if no more work to load', async () => {
    const wrapper = shallowMount(MoreWork, { localVue, store, stubs })

    store.dispatch = jest.fn().mockImplementation((action: string) => {
      if (action === 'workview/requestWork') { return { data: [] } }
    })

    await emitRootStub(wrapper, 'click')
    expect(store.dispatch).toHaveBeenCalledWith('toast/notify', { content: expect.any(String) })
  })

  it('does not disable button', () => {
    const wrapper = shallowMount(MoreWork, { localVue, store, stubs })
    const button = wrapper.find('custom-button-stub')
    expect(button.attributes('disabled')).toBeTruthy()
  })
})
