import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buildDatasetItemsCountPayload } from 'test/unit/factories'
import { nthEmitted } from 'test/unit/testHelpers'

import { StatusFilter } from '@/components/WorkView/WorkflowFilter'
import { DatasetItemStatus } from '@/store/types'

const localVue = createLocalVue()
localVue.use(Vuex)

let propsData: { positiveStatuses: DatasetItemStatus[], negativeStatuses: DatasetItemStatus[] }
let store: ReturnType<typeof createTestStore>
const mocks = { $can: () => true }
const stubs = ['status-filter']

beforeEach(() => {
  store = createTestStore()
  store.commit('workview/SET_DATASET_ITEM_COUNTS', buildDatasetItemsCountPayload())
  propsData = { positiveStatuses: [], negativeStatuses: [] }
})

describe('filtering by status', () => {
  it('adds status to existing filtered statuses', () => {
    const wrapper = shallowMount(StatusFilter, { localVue, mocks, propsData, store, stubs })
    const component = wrapper.vm as any

    component.onSelectedStatusChange({
      positiveOptions: ['complete', 'annotate'],
      negativeOptions: ['new', 'review']
    })
    expect(nthEmitted(wrapper, 'update:positive-statuses', 0)).toEqual([['complete', 'annotate']])
    expect(nthEmitted(wrapper, 'update:negative-statuses', 0)).toEqual([['new', 'review']])
    expect(nthEmitted(wrapper, 'update:commented', 0)).toEqual([false])
    expect(nthEmitted(wrapper, 'change', 0))
      .toEqual([{ positiveOptions: ['complete', 'annotate'], negativeOptions: ['new', 'review'] }])

    component.onSelectedStatusChange({ positiveOptions: [], negativeOptions: [] })
    expect(nthEmitted(wrapper, 'update:positive-statuses', 1)).toEqual([[]])
    expect(nthEmitted(wrapper, 'update:negative-statuses', 1)).toEqual([[]])
    expect(nthEmitted(wrapper, 'update:commented', 1)).toEqual([false])
    expect(nthEmitted(wrapper, 'change', 1)).toEqual([{ positiveOptions: [], negativeOptions: [] }])

    component.onSelectedStatusChange({
      positiveOptions: ['complete', 'annotate', 'commented'],
      negativeOptions: ['new', 'review', 'done']
    })
    expect(nthEmitted(wrapper, 'update:positive-statuses', 2)).toEqual([['complete', 'annotate']])
    expect(nthEmitted(wrapper, 'update:negative-statuses', 2)).toEqual([['new', 'review', 'done']])
    expect(nthEmitted(wrapper, 'update:commented', 2)).toEqual([true])
    expect(nthEmitted(wrapper, 'change', 2)).toEqual([{
      positiveOptions: ['complete', 'annotate', 'commented'],
      negativeOptions: ['new', 'review', 'done']
    }])
  })
})
