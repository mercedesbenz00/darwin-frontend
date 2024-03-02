import { createLocalVue, shallowMount, Wrapper } from '@vue/test-utils'
import VModal from 'vue-js-modal'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { emitRootStub } from 'test/unit/testHelpers'

import ConfirmationDialog from '@/components/Common/ConfirmationDialog.vue'
import { installCommonComponents } from '@/plugins/components'

const localVue = createLocalVue()
installCommonComponents(localVue)
localVue.use(VModal)
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>

let propsData: {
  name: string
  title: string
  detail?: string
}

beforeEach(() => {
  propsData = { name: 'test-dialog', title: 'Test', detail: 'Test content' }
  store = createTestStore()
})

it('matches snapshot', () => {
  const wrapper = shallowMount(ConfirmationDialog, { localVue, propsData })
  expect(wrapper).toMatchSnapshot()
})

describe('show/hide with data', () => {
  let wrapper: Wrapper<Vue>

  beforeEach(() => {
    wrapper = shallowMount(ConfirmationDialog, { localVue, propsData, store })
    const component = wrapper.vm as any
    component.show({ foo: 'bar' })
  })

  it('sets data', () => {
    expect(wrapper.vm.$data.data).toEqual({ foo: 'bar' })
  })

  it('toggles UI', async () => {
    await emitRootStub(wrapper, 'before-open')
    expect(store.dispatch).toHaveBeenCalledWith('ui/putBackSidebar')
  })

  it('passes data on confirm', async () => {
    await wrapper.find('positive-button-stub').vm.$emit('click')
    expect(wrapper.emitted().confirmed).toEqual([[{ foo: 'bar' }]])
  })

  it('clears data on cancel', async () => {
    await wrapper.find('secondary-button-stub').vm.$emit('click')
    expect(wrapper.vm.$data.data).toBeNull()
  })

  it('passed data on "canceled"', async () => {
    await wrapper.find('secondary-button-stub').vm.$emit('click')
    expect(wrapper.emitted().canceled).toBeDefined()
    expect(wrapper.emitted().canceled![0]).toEqual([{ foo: 'bar' }])
  })

  it('toggles UI on close', async () => {
    await emitRootStub(wrapper, 'closed')
    expect(store.dispatch).toHaveBeenCalledWith('ui/bringFrontSidebar')
  })
})

describe('show/close without data', () => {
  let wrapper: Wrapper<Vue>

  beforeEach(() => {
    const data = () => ({ data: 'existing' })
    wrapper = shallowMount(ConfirmationDialog, { data, localVue, propsData, store })
    const component = wrapper.vm as any
    component.show()
  })

  it('clears data', () => {
    expect(wrapper.vm.$data.data).toBeNull()
  })

  it('toggles UI', async () => {
    await emitRootStub(wrapper, 'before-open')
    expect(store.dispatch).toHaveBeenCalledWith('ui/putBackSidebar')
  })

  it('emits confirm with no data', async () => {
    await wrapper.find('positive-button-stub').vm.$emit('click')
    expect(wrapper.emitted().confirmed).toHaveLength(1)
  })

  it('clears data on cancel', async () => {
    await wrapper.find('secondary-button-stub').vm.$emit('click')
    expect(wrapper.vm.$data.data).toBeNull()
  })

  it('emits "canceled" with no data', async () => {
    await wrapper.find('secondary-button-stub').vm.$emit('click')
    expect(wrapper.emitted().canceled).toBeDefined()
  })

  it('clears data on close', async () => {
    const component = wrapper.vm as any
    component.close()
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.$data.data).toBeNull()
  })

  it('toggles UI on close', async () => {
    await emitRootStub(wrapper, 'closed')
    expect(store.dispatch).toHaveBeenCalledWith('ui/bringFrontSidebar')
  })
})

it('accepts slot for central area', () => {
  const slots = { detail: 'Custom detail slot' }
  delete propsData.detail
  const wrapper = shallowMount(ConfirmationDialog, { localVue, propsData, slots, store })
  expect(wrapper).toMatchSnapshot()
  expect(wrapper.html()).toContain(slots.detail)
})
