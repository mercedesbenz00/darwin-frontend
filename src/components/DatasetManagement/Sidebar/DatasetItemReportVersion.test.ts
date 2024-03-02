import { createLocalVue, shallowMount } from '@vue/test-utils'
import VTooltip from 'v-tooltip'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buildDatasetItemReportPayloadFinished, buildDatasetItemReportPayloadStarted } from 'test/unit/factories/buildDatasetItemReportPayload'

import DatasetItemReportVersion from '@/components/DatasetManagement/Sidebar/DatasetItemReportVersion.vue'
import { DatasetItemReportPayload } from '@/store/modules/datasetItemReports/types'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(VTooltip, { defaultHtml: true })

let store: ReturnType<typeof createTestStore>
let propsData: {
  report: DatasetItemReportPayload
}

beforeEach(() => {
  store = createTestStore()
  propsData = {
    report: buildDatasetItemReportPayloadStarted()
  }
})

it('matches snapshot', () => {
  const wrapper = shallowMount(DatasetItemReportVersion, { localVue, store, propsData })
  expect(wrapper).toMatchSnapshot()
})

it('delete button should trigger delete action', async () => {
  const wrapper = shallowMount(DatasetItemReportVersion, { localVue, store, propsData })
  await wrapper.find('.dataset-report__header__trash-button').trigger('click')
  expect(store.dispatch).toHaveBeenCalledWith('datasetItemReports/deleteDatasetItemReport', {
    reportId: propsData.report.id
  })
})

describe('"finished" state', () => {
  beforeEach(() => {
    propsData = {
      report: buildDatasetItemReportPayloadFinished()
    }
  })

  it('should display download button for finished', () => {
    const wrapper = shallowMount(DatasetItemReportVersion, { localVue, store, propsData })
    expect(wrapper.find('.dataset-report__spinner').exists()).toBeFalsy()
    expect(wrapper.find('.dataset-report__header__download-button').exists()).toBeTruthy()
  })

  it('should display "Complete" text for finished state', () => {
    const wrapper = shallowMount(DatasetItemReportVersion, { localVue, store, propsData })
    expect(
      wrapper.find('.dataset-report__body').text().includes('Complete')
    ).toBeTruthy()
  })
})

describe('"started" state', () => {
  beforeEach(() => {
    propsData = {
      report: buildDatasetItemReportPayloadStarted()
    }
  })

  it('should display spinner for non finished state', () => {
    const wrapper = shallowMount(DatasetItemReportVersion, { localVue, store, propsData })
    expect(wrapper.find('.dataset-report__spinner').exists()).toBeTruthy()
    expect(wrapper.find('.dataset-report__header__download-button').exists()).toBeFalsy()
  })

  it('should display "Generating" text for non finished state', () => {
    const wrapper = shallowMount(DatasetItemReportVersion, { localVue, store, propsData })
    expect(
      wrapper.find('.dataset-report__body').text().includes('Generating')
    ).toBeTruthy()
  })
})
