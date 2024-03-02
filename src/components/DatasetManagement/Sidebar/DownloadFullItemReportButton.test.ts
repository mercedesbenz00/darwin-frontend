import { createLocalVue, shallowMount } from '@vue/test-utils'
import PortalVue from 'portal-vue'
import VTooltip from 'v-tooltip'
import VueJSModal from 'vue-js-modal'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'

import DownloadFullItemReportButton from '@/components/DatasetManagement/Sidebar/DownloadFullItemReportButton.vue'
import loading from '@/directives/loading'
import { installCommonComponents } from '@/plugins/components'

const localVue = createLocalVue()
localVue.directive('loading', loading)
localVue.use(Vuex)
localVue.use(PortalVue)
localVue.use(VTooltip)
localVue.use(VueJSModal, { dynamic: true })
installCommonComponents(localVue)

let store: ReturnType<typeof createTestStore>
let mocks: any

beforeEach(() => {
  store = createTestStore()
  mocks = {
    $can: jest.fn().mockReturnValue(true),
    $modal: {
      show: jest.fn(),
      hide: jest.fn()
    }
  }
})

it('matches snapshot', () => {
  const wrapper = shallowMount(DownloadFullItemReportButton, { localVue, store, mocks })
  expect(wrapper).toMatchSnapshot()
})

it('should show modal window on "Download Report" button click', async () => {
  const wrapper = shallowMount(DownloadFullItemReportButton, { localVue, store, mocks })
  await wrapper.find('.reports-button').vm.$emit('click')
  expect(mocks.$modal.show).toHaveBeenCalledWith('download-report')
})

it('should load reports before open modal', () => {
  const wrapper: any = shallowMount(DownloadFullItemReportButton, { localVue, store, mocks })
  wrapper.vm.onBeforeOpen()
  expect(store.dispatch).toHaveBeenCalledWith('datasetItemReports/loadDatasetItemReports')
})

it('should create report on "Generate a new report" button click', async () => {
  const wrapper = shallowMount(DownloadFullItemReportButton, { localVue, store, mocks })
  await wrapper.find('primary-button-stub').vm.$emit('click')
  expect(store.dispatch).toHaveBeenCalledWith('datasetItemReports/createDatasetItemReport')
})
