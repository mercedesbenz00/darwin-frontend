import { setActivePinia, createPinia } from 'pinia'

import { fakeError } from 'test/unit/responseStubs'

import * as backend from '@/utils/backend'

import { useItemCountsStore } from './useItemCountsStore'

jest.mock('@/utils/backend', () => ({
  loadV2ItemsStageCounts: jest.fn()
}))

beforeEach(() => {
  setActivePinia(createPinia())
})

it('initializes', () => {
  expect(() => useItemCountsStore()).not.toThrow()
})

describe('actions.setTeamSlug', () => {
  it('sets team slug', () => {
    const store = useItemCountsStore()
    expect(store.teamSlug).toEqual(null)
    store.setTeamSlug('v7')
    expect(store.teamSlug).toEqual('v7')
  })
})

describe('actions.loadStageCounts', () => {
  let store: ReturnType<typeof useItemCountsStore>
  
  beforeEach(() => {
    store = useItemCountsStore()
    store.teamSlug = 'v7'

    jest
      .spyOn(backend, 'loadV2ItemsStageCounts')
      .mockResolvedValue({ data: { simple_counts: [] } })
  })

  it('loads stage counts from backend', async () => {
    await store.loadStageCounts({ dataset_ids: [1] })

    expect(backend.loadV2ItemsStageCounts)
      .toHaveBeenCalledWith({filters: {dataset_ids: [1]}, teamSlug: 'v7'})
  })

  it('sets result into store', async () => {
    await store.loadStageCounts({ dataset_ids: [1] })
    expect(store.stageCounts).toEqual({ 
      data: { simple_counts: []}, 
      error: null,
      status: 'fetched' 
    })
  })

  it('operates on optimistic UI', async () => {
    expect(store.stageCounts).toEqual({ data: null, error: null, status: 'unfetched' })
    
    const pending = store.loadStageCounts({ dataset_ids: [1] })
    expect(store.stageCounts).toEqual({ data: null, error: null, status: 'fetching' })
    
    await pending
    expect(store.stageCounts).toEqual({ 
      data: { simple_counts: [] }, 
      error: null, 
      status: 'fetched' 
    })
  })

  it('resets old state before making a new fetch', async () => {
    expect(store.stageCounts.data).toEqual(null)
    
    // load once to and ensure data is set
    await store.loadStageCounts({ dataset_ids: [1] })
    expect(store.stageCounts.data).not.toEqual(null)
    
    // fire of a load, but do not await yet, so we can verify
    const pending = store.loadStageCounts({ dataset_ids: [1] })
    expect(store.stageCounts.data).toEqual(null)

    // wait for load to complete and verify its set again
    await pending
    expect(store.stageCounts.data).not.toEqual(null)
  })

  it('returns and handlers error', async () => {
    jest
      .spyOn(backend, 'loadV2ItemsStageCounts')
      .mockResolvedValue({ error: fakeError })
    
    const response = await store.loadStageCounts({ dataset_ids: [1] })
    
    expect(store.stageCounts).toEqual({ 
      status: 'error',
      data: null, 
      error: fakeError
    })

    expect(response?.error).toEqual(fakeError)
  })
})
