import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'

import { createMockTheme } from 'test/unit/components/mocks'
import createTestStore from 'test/unit/createTestStore'

import { VIEW_MODE } from '@/components/Common/Gallery/types'
import GalleryControl from '@/components/DatasetManagement/Sidebar/GalleryControl.vue'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>
const mocks = { $theme: createMockTheme() }
const stubs = ['slider', 'switch-gallery-layout']

beforeEach(() => { store = createTestStore() })
describe('change card width', () => {
  it('changes card width when slider changes', () => {
    const wrapper = shallowMount(GalleryControl, { localVue, mocks, store, stubs })

    jest.spyOn(store, 'commit').mockReturnValue(undefined)
    wrapper.find('slider-stub').vm.$emit('change', 2)
    expect(store.commit).toHaveBeenCalledWith('dataset/SET_DATA_TAB_COLUMN_COUNT', 6)
  })
})

describe('change layout mode', () => {
  it('changes view mode when switch layout on sidebar', () => {
    const wrapper = shallowMount(GalleryControl, { localVue, mocks, store, stubs })

    jest.spyOn(store, 'commit').mockReturnValue(undefined)
    wrapper.find('switch-gallery-layout-stub').vm.$emit('change', VIEW_MODE.LIST)
    expect(store.commit).toHaveBeenCalledWith('dataset/SET_DATA_TAB_VIEW_MODE', VIEW_MODE.LIST)
  })
})
