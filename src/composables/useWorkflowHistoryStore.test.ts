import { setActivePinia, createPinia } from 'pinia'

import { useWorkflowHistoryStore } from '@/composables/useWorkflowHistoryStore'
import {
  V2WorkflowPayload
} from '@/store/types'

beforeEach(() => {
  setActivePinia(createPinia())
})

it('initializes', () => {
  let s: ReturnType<typeof useWorkflowHistoryStore>
  expect(() => {
    s = useWorkflowHistoryStore()
    expect(s.history).toEqual([])
    expect(s.pointer).toEqual(0)
  }).not.toThrow()
})

describe('adds and removes items as expected', () => {
  it('updates the history array when pushing 1 item', () => {
    const store = useWorkflowHistoryStore()
    expect(store.history.length).toEqual(0)
    store.push({ id: '1' } as V2WorkflowPayload)
    expect(store.history.length).toEqual(1)
    expect(store.pointer).toEqual(0)
    expect(store.history[0]).toEqual({ id: '1' })
  })

  it('pop when there is 1 item keeps it without going to null or undefined', () => {
    const store = useWorkflowHistoryStore()
    store.push({ id: '1' } as V2WorkflowPayload)
    store.undo()
    expect(store.history.length).toEqual(1)
    expect(store.pointer).toEqual(0)
    expect(store.history[0]).toEqual({ id: '1' })
  })

  it('updates the history array when pushing 2 items', () => {
    const store = useWorkflowHistoryStore()
    expect(store.history.length).toEqual(0)
    store.push({ id: '1' } as V2WorkflowPayload)
    store.push({ id: '2' } as V2WorkflowPayload)
    expect(store.history.length).toEqual(2)
    expect(store.history[0]).toEqual({ id: '1' })
    expect(store.history[1]).toEqual({ id: '2' })
    expect(store.pointer).toEqual(1)
  })

  it('updates the history array when push-pop-push', () => {
    const store = useWorkflowHistoryStore()
    expect(store.history.length).toEqual(0)
    store.push({ id: '1' } as V2WorkflowPayload)
    store.push({ id: '2' } as V2WorkflowPayload)
    store.undo()
    expect(store.history.length).toEqual(2)
    expect(store.history[0]).toEqual({ id: '1' })
    expect(store.history[1]).toEqual({ id: '2' })
    expect(store.pointer).toEqual(0)
    expect(store.peak).toEqual({ id: '1' })
    store.push({ id: '3' } as V2WorkflowPayload)
    expect(store.history.length).toEqual(2)
    expect(store.history[0]).toEqual({ id: '1' })
    expect(store.history[1]).toEqual({ id: '3' })
    expect(store.peak).toEqual({ id: '3' })
    expect(store.pointer).toEqual(1)
  })

  it('pops many times without causing troubles', () => {
    const store = useWorkflowHistoryStore()
    expect(store.history.length).toEqual(0)
    store.push({ id: '1' } as V2WorkflowPayload)
    store.push({ id: '2' } as V2WorkflowPayload)
    expect(store.undo()).toEqual({ id: '1' })
    expect(store.pointer).toEqual(0)
    expect(store.undo()).toEqual({ id: '1' })
    expect(store.pointer).toEqual(0)
    expect(store.undo()).toEqual({ id: '1' })
    expect(store.pointer).toEqual(0)
    expect(store.undo()).toEqual({ id: '1' })
    expect(store.history.length).toEqual(2)
    expect(store.peak).toEqual({ id: '1' })
    store.push({ id: '3' } as V2WorkflowPayload)
    expect(store.history.length).toEqual(2)
    expect(store.history[0]).toEqual({ id: '1' })
    expect(store.history[1]).toEqual({ id: '3' })
    expect(store.pointer).toEqual(1)
    expect(store.peak).toEqual({ id: '3' })
  })

  it('redos many times without causing troubles', () => {
    const store = useWorkflowHistoryStore()
    expect(store.history.length).toEqual(0)
    store.push({ id: '1' } as V2WorkflowPayload)
    store.push({ id: '2' } as V2WorkflowPayload)
    store.push({ id: '3' } as V2WorkflowPayload)
    expect(store.undo()).toEqual({ id: '2' })
    expect(store.pointer).toEqual(1)
    expect(store.undo()).toEqual({ id: '1' })
    expect(store.pointer).toEqual(0)
    expect(store.undo()).toEqual({ id: '1' })
    expect(store.pointer).toEqual(0)
    expect(store.undo()).toEqual({ id: '1' })
    expect(store.history.length).toEqual(3)
    expect(store.peak).toEqual({ id: '1' })
    expect(store.redo()).toEqual({ id: '2' })
    expect(store.redo()).toEqual({ id: '3' })
    expect(store.redo()).toEqual({ id: '3' })
  })
})
