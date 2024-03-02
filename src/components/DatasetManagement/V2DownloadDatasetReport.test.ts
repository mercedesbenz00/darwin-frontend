import { createLocalVue, shallowMount } from '@vue/test-utils'
import PortalVue from 'portal-vue'
import VTooltip from 'v-tooltip'
import VueJSModal from 'vue-js-modal'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'

import V2DownloadDatasetReportButton from '@/components/DatasetManagement/V2DownloadDatasetReport.vue'
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

beforeEach(() => {
  store = createTestStore()
})

it('matches snapshot', () => {
  const wrapper = shallowMount(V2DownloadDatasetReportButton, { localVue, store })
  expect(wrapper).toMatchSnapshot()
})

it('should load reports before open modal', () => {
  const wrapper = shallowMount(V2DownloadDatasetReportButton, { localVue, store })
  wrapper.vm.onBeforeOpen()
  expect(store.dispatch).toHaveBeenCalledWith('datasetItemReports/loadDatasetItemReports')
})

it('should create report on "Generate a new report" button click', async () => {
  const wrapper = shallowMount(V2DownloadDatasetReportButton, { localVue, store })
  await wrapper.find('primary-button-stub').vm.$emit('click')
  expect(store.dispatch).toHaveBeenCalledWith('datasetItemReports/createDatasetItemReport')
})
