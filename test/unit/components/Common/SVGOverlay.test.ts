import { createLocalVue, shallowMount } from '@vue/test-utils'
import flushPromises from 'flush-promises'

import { buildAxiosResponse } from 'test/unit/factories'

import SVGOverlay from '@/components/Common/SVGOverlay.vue'
import { api } from '@/utils'

const localVue = createLocalVue()

interface StorageMock {
  getItem: (key: string) => string | null
  setItem: (key: string, value: any) => void
  removeItem: (key: string) => void
}

class Mock implements StorageMock {
  private store: { [s: string]: string } = {}
  getItem = (key: string) => this.store[key] || null
  setItem = (key: string, value: any) => { this.store[key] = value.toISOString ? value.toISOString() : value.toString() }
  removeItem = (key: string) => delete this.store[key]
}

const initComponent = (propsData = {}) => {
  const defaultPropsData = { url: 'svg url' }
  const wrapper = shallowMount(SVGOverlay, {
    localVue,
    propsData: { ...defaultPropsData, ...propsData }
  })
  return wrapper
}

const mockApiCall = () => {
  return jest.spyOn(api, 'loadSVGFile').mockResolvedValue(buildAxiosResponse({
    data: 'Primary Color: "{{primaryColor}}", Secondary Color: "{{secondaryColor}}"'
  }))
}

beforeEach(() => {
  Object.defineProperty(window, 'localStorage', { value: new Mock() })
  Object.defineProperty(window, 'sessionStorage', { value: new Mock() })
})

afterEach(() => {
  (api.loadSVGFile as jest.Mock).mockClear()
})

it('matches the snapshot after replacing the colors properly', async () => {
  mockApiCall()
  const wrapper = initComponent()
  await flushPromises()
  expect(wrapper).toMatchSnapshot()
})

it('if svg has not been loaded yet, loads from api call', async () => {
  const fn = mockApiCall()

  initComponent({ url: 'svg2' })
  await flushPromises()
  expect(fn).toBeCalledWith('svg2')
})

it('when svg is loaded, dispatches svg_loaded event', async () => {
  const fn = jest.fn()
  Object.defineProperty(window, 'dispatchEvent', { value: fn })

  initComponent({ url: 'svg3' })
  await flushPromises()
  expect(fn).toBeCalledWith(new CustomEvent(
    'svg_loaded',
    { detail: { success: true, url: 'svg3' } }
  ))
})

it('if svg is being loaded, don\'t make api request', () => {
  const fn = jest.spyOn(api, 'loadSVGFile')

  window.sessionStorage.setItem('svg4_loading', 'true')
  initComponent({ url: 'svg4' })
  expect(fn).toBeCalledTimes(0)
})

it('if the storage contains loaded svg, use that.', async () => {
  window.sessionStorage.setItem('svg5', 'Data is already loaded')

  const fn = jest.spyOn(api, 'loadSVGFile')
  const wrapper = initComponent({ url: 'svg5' })
  await flushPromises()
  expect(fn).toBeCalledTimes(0)
  expect(wrapper).toMatchSnapshot()
})

it('if svg is not loaded properly, logs error and set the loading status to false', async () => {
  jest.spyOn(api, 'loadSVGFile').mockRejectedValue({ message: 'svg not found' })
  const fn = jest.spyOn(console, 'error').mockReturnThis()

  initComponent({ url: 'svg6' })
  await flushPromises()
  expect(fn).toBeCalledWith('SVG Load error: ', { message: 'svg not found' })
  expect(window.sessionStorage.getItem('svg6_loading')).toBe('false')
})
