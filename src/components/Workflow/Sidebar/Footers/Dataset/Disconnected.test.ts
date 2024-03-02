import { createTestingPinia } from '@pinia/testing'
import { createLocalVue, shallowMount } from '@vue/test-utils'
import { PiniaVuePlugin } from 'pinia'

import DatasetDisconnected from '@/components/Workflow/Sidebar/Footers/Dataset/Disconnected.vue'
import { useWorkflowSceneStore } from '@/composables/useWorkflowSceneStore'

const localVue = createLocalVue()
localVue.use(PiniaVuePlugin)

let pinia: ReturnType<typeof createTestingPinia>
let scene: ReturnType<typeof useWorkflowSceneStore>

beforeEach(() => {
  pinia = createTestingPinia()
  scene = useWorkflowSceneStore()
})

describe('when a dataset is selected', () => {
  beforeEach(() => {
    scene.selectedDatasetId = 1
  })

  it('matches snapshot', () => {
    const wrapper = shallowMount(DatasetDisconnected, { localVue, pinia })
    expect(wrapper).toMatchSnapshot()
  })

  it('renders confirm button as enabled', () => {
    const wrapper = shallowMount(DatasetDisconnected, { localVue, pinia })
    expect(wrapper.find('custom-button-stub').props('disabled')).toBe(false)
  })
})

describe('when no dataset is selected', () => {
  beforeEach(() => {
    scene.selectDataset(null)
  })

  it('matches snapshot', () => {
    const wrapper = shallowMount(DatasetDisconnected, { localVue, pinia })
    expect(wrapper).toMatchSnapshot()
  })

  it('renders confirm button as disabled', () => {
    const wrapper = shallowMount(DatasetDisconnected, { localVue, pinia })
    expect(wrapper.find('custom-button-stub').props('disabled')).toBe(true)
  })
})
