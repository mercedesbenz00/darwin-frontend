import { createLocalVue } from '@vue/test-utils'
import Vue from 'vue'
import VueToast, { ToastObject } from 'vue-toasted'
import Vuex from 'vuex'

import toast, { getInitialState as toastState } from '@/store/modules/toast'
import { RootState } from '@/store/types'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(VueToast, {
  position: 'bottom-center',
  duration: 550,
  iconPack: 'fontawesome',
  closeOnSwipe: false,
  theme: 'bubble'
})

const newStore = () => new Vuex.Store<RootState>({
  modules: {
    toast: { ...toast, state: toastState() }
  }
})

let store: ReturnType<typeof newStore>
let showToast: jest.SpyInstance
let fakeElement: HTMLElement

beforeEach(() => {
  // the store uses the global vue instance to dispatch toasts, so we need to stub it out
  (Vue as any).toasted = {
    show: () => {
      fakeElement = document.createElement('div')

      const fakeToast: Pick<ToastObject, 'el' | 'goAway' | 'text'> = {
        el: fakeElement,
        goAway: jest.fn(),
        text: jest.fn()
      }

      return fakeToast
    }
  }

  jest.useFakeTimers()
  showToast = jest.spyOn(Vue.toasted, 'show')
  store = newStore()
})

afterEach(() => {
  jest.clearAllTimers()
  jest.useRealTimers()
})

describe('toast/toast', () => {
  it('creates toast', () => {
    store.dispatch('toast/toast', { type: 'warning', content: 'Message' })
    expect(showToast).toHaveBeenCalledWith('Message', expect.anything())
  })

  it('maps "warning" type to "error"', () => {
    store.dispatch('toast/toast', { type: 'warning', content: 'Message' })
    expect(showToast)
      .toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ type: 'error' }))
  })

  it('maps "notify" type to "info"', () => {
    store.dispatch('toast/toast', { type: 'notify', content: 'Message' })
    expect(showToast)
      .toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ type: 'info' }))
  })

  it('uses default type', () => {
    store.dispatch('toast/toast', { content: 'Message' })
    expect(showToast)
      .toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ type: 'error' }))
  })

  it('passes duration', () => {
    store.dispatch('toast/toast', { content: 'Message', duration: 500 })
    expect(showToast)
      .toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ duration: null }))

    expect(store.state.toast.toasts[0])
      .toEqual(expect.objectContaining({ duration: 500 }))
  })

  it('uses default duration', () => {
    store.dispatch('toast/toast', { content: 'Message' })
    expect(showToast)
      .toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ duration: null }))

    expect(store.state.toast.toasts[0])
      .toEqual(expect.objectContaining({ duration: 9000 }))
  })

  it('sets toast to expire after duration', () => {
    store.dispatch('toast/toast', { content: 'Message', duration: 1500 })

    jest.advanceTimersByTime(1450)
    expect(store.state.toast.toasts).toHaveLength(1)
    const { goAway } = store.state.toast.toasts[0]
    expect(goAway).not.toHaveBeenCalled()

    jest.advanceTimersByTime(100)
    expect(store.state.toast.toasts.length).toEqual(0)
    expect(goAway).toHaveBeenCalledWith(0)
  })

  it('sets toast to expire 100ms after click', () => {
    store.dispatch('toast/toast', { content: 'Message', duration: 1500 })

    fakeElement.click()

    expect(store.state.toast.toasts).toHaveLength(1)
    const { goAway } = store.state.toast.toasts[0]
    expect(goAway).not.toHaveBeenCalled()

    jest.advanceTimersByTime(100)
    expect(store.state.toast.toasts.length).toEqual(0)
    expect(goAway).toHaveBeenCalledWith(0)
  })

  it('adds toast to state', () => {
    store.dispatch('toast/toast', { content: 'Message' })
    expect(store.state.toast.toasts).toHaveLength(1)
    expect(store.state.toast.toasts[0]).toEqual({
      changeText: expect.any(Function),
      content: 'Message',
      duration: 9000,
      goAway: expect.any(Function),
      id: expect.any(String),
      ref: expect.any(Number),
      repeat: 1,
      type: 'warning'
    })

    store.dispatch('toast/toast', { content: 'Message2' })
    expect(store.state.toast.toasts.length).toEqual(2)
  })

  it('replaces existing toast if matched by content and type', () => {
    store.dispatch('toast/toast', { content: 'Message', type: 'notify' })
    const [toast] = store.state.toast.toasts

    store.dispatch('toast/toast', { content: 'Message', type: 'notify' })
    expect(store.state.toast.toasts).toHaveLength(1)
    expect(toast.repeat).toEqual(2)
    expect(toast.changeText).toHaveBeenCalledWith('Message (2)')

    store.dispatch('toast/toast', { content: 'Message', type: 'warning' })
    expect(store.state.toast.toasts.length).toEqual(2)

    store.dispatch('toast/toast', { content: 'Message2', type: 'warning' })
    expect(store.state.toast.toasts.length).toEqual(3)
  })
})

describe('toast/notify', () => {
  beforeEach(() => {
    jest.spyOn(store, 'dispatch')
  })

  it('delegates to "toast" with "notification" type', () => {
    store.dispatch('toast/notify', { content: 'Notification' })
    expect(store.dispatch)
      .toHaveBeenCalledWith('toast/toast', { content: 'Notification', type: 'notify' })
  })
})

describe('toast/warning', () => {
  beforeEach(() => {
    jest.spyOn(store, 'dispatch')
  })

  it('delegates to "toast" with "warning" type', () => {
    store.dispatch('toast/warning', { content: 'Warning' })
    expect(store.dispatch)
      .toHaveBeenCalledWith('toast/toast', { content: 'Warning', type: 'warning' })
  })
})

describe('toast/remove', () => {
  it('removes toast by id, after specified delay', async () => {
    await store.dispatch('toast/toast', { content: 'Message' })
    const [toast] = store.state.toast.toasts

    await store.dispatch('toast/remove', { id: toast.id, delay: 500 })
    expect(store.state.toast.toasts).toHaveLength(1)
    expect(toast.goAway).not.toHaveBeenCalled()

    jest.advanceTimersByTime(400)
    expect(store.state.toast.toasts).toHaveLength(1)
    expect(toast.goAway).not.toHaveBeenCalled()

    jest.advanceTimersByTime(105)
    expect(store.state.toast.toasts.length).toEqual(0)
    expect(toast.goAway).toHaveBeenCalledWith(0)
  })

  it('cancels old removal, if any', async () => {
    await store.dispatch('toast/toast', { content: 'Message' })
    const [toast] = store.state.toast.toasts

    await store.dispatch('toast/remove', { id: toast.id, delay: 500 })
    await store.dispatch('toast/remove', { id: toast.id, delay: 1000 })

    jest.advanceTimersByTime(600)
    expect(store.state.toast.toasts).toHaveLength(1)
    jest.advanceTimersByTime(401)
    expect(store.state.toast.toasts.length).toEqual(0)
  })

  it('does nothing if not matched by id', async () => {
    await store.dispatch('toast/toast', { content: 'Message' })
    await store.dispatch('toast/remove', { id: -1, delay: 500 })
    jest.advanceTimersByTime(600)
    expect(store.state.toast.toasts).toHaveLength(1)
  })
})
