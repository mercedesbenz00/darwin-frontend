import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { emitRootStub, nthEmitted } from 'test/unit/testHelpers'

import StatusFilter from '@/components/DatasetManagement/Sidebar/StatusFilter.vue'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>
const stubs = ['status-filter']

beforeEach(() => {
  store = createTestStore()
  jest.spyOn(store, 'commit').mockReturnValue(undefined)
})

describe('filtering by status', () => {
  it('adds status to existing filtered statuses', async () => {
    const wrapper = shallowMount(StatusFilter, { localVue, store, stubs })

    await emitRootStub(wrapper, 'change', {
      positiveOptions: ['complete', 'annotate'],
      negativeOptions: ['new', 'review']
    })
    expect(nthEmitted(wrapper, 'update:positive-statuses', 0)).toEqual([['complete', 'annotate']])
    expect(nthEmitted(wrapper, 'update:negative-statuses', 0)).toEqual([['new', 'review']])
    expect(nthEmitted(wrapper, 'update:commented', 0)).toEqual([false])
    expect(nthEmitted(wrapper, 'change', 0)).toEqual([{
      positiveOptions: ['complete', 'annotate'],
      negativeOptions: ['new', 'review']
    }])

    await emitRootStub(wrapper, 'change', { positiveOptions: [], negativeOptions: [] })
    expect(nthEmitted(wrapper, 'update:positive-statuses', 1)).toEqual([[]])
    expect(nthEmitted(wrapper, 'update:negative-statuses', 1)).toEqual([[]])
    expect(nthEmitted(wrapper, 'update:commented', 1)).toEqual([false])
    expect(nthEmitted(wrapper, 'change', 1)).toEqual([{ positiveOptions: [], negativeOptions: [] }])

    await emitRootStub(wrapper, 'change', {
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
