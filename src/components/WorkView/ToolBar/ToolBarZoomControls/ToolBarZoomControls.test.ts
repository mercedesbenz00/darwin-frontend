import { createLocalVue, shallowMount } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import Vuex from 'vuex'

import { stubDirectiveWithAttribute } from 'test/unit/directiveStubs'

import { ToolBarZoomControls } from '@/components/WorkView/ToolBar'
import workview, { getInitialState as getInitialWorkviewState } from '@/store/modules/workview'
import { RESET_ZOOM_MODE } from '@/store/types'

const localVue = createLocalVue()

localVue.prototype.$ga = { event () { } }
localVue.use(Vuex)
localVue.directive('tooltip', stubDirectiveWithAttribute)

const propsData = {
  scale: 3
}

const newStore = () => {
  const store =
  new Vuex.Store({
    modules: { workview: { ...workview, state: getInitialWorkviewState() } }
  })
  jest.spyOn(store, 'dispatch').mockResolvedValue({})
  return store
}

it('scale to fit when you click on scale button', () => {
  const store = newStore()
  const wrapper = shallowMount(ToolBarZoomControls, { localVue, propsData, store })
  const button = wrapper.find('.zoom-controls__button__fit')
  button.vm.$emit('click')
  expect(wrapper.emitted()['scale-to-fit']).toBeDefined()
})

it('matches snapshot in RESET mode', () => {
  const store = newStore()
  store.commit('workview/SET_RESET_ZOOM_MODE', RESET_ZOOM_MODE.RESET)
  const wrapper = shallowMount(ToolBarZoomControls, { localVue, propsData, store })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot in FIXED mode', () => {
  const store = newStore()
  store.commit('workview/SET_RESET_ZOOM_MODE', RESET_ZOOM_MODE.FIXED)
  const wrapper = shallowMount(ToolBarZoomControls, { localVue, propsData, store })
  expect(wrapper).toMatchSnapshot()
})

it('updates resetZoomMode in workview store on click', async () => {
  const store = newStore()
  store.commit('workview/SET_RESET_ZOOM_MODE', RESET_ZOOM_MODE.RESET)
  const wrapper = shallowMount(ToolBarZoomControls, { localVue, propsData, store })
  const button = wrapper.find('.zoom-controls__button__toggle')
  await button.vm.$emit('click')
  await flushPromises()
  expect(store.dispatch).toBeCalledWith('workview/setResetZoomMode', RESET_ZOOM_MODE.FIXED)
})

it('updates resetZoomMode in workview store on click', async () => {
  const store = newStore()
  store.commit('workview/SET_RESET_ZOOM_MODE', RESET_ZOOM_MODE.FIXED)
  const wrapper = shallowMount(ToolBarZoomControls, { localVue, propsData, store })
  const button = wrapper.find('.zoom-controls__button__toggle')
  await button.vm.$emit('click')
  await flushPromises()
  expect(store.dispatch).toBeCalledWith('workview/setResetZoomMode', RESET_ZOOM_MODE.RESET)
})
