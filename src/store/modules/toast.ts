import { v4 as uuidv4 } from 'uuid'
import Vue from 'vue'
import { GetterTree, ActionTree, MutationTree } from 'vuex'

import { RootState, TypedAction } from '@/store/types'
import { copyAttributes } from '@/utils'

const DEFAULT_DURATION = 9000

type Toast = {
  changeText: (text: string) => void
  content: string
  duration: number
  goAway: (duration: number) => void
  id: string
  ref?: number
  repeat: number
  type: 'notify' | 'warning'
}

export type ToastState = {
  toasts: Toast[]
}

// initial state
export const getInitialState = (): ToastState => ({ toasts: [] })

const state: ToastState = getInitialState()

// getters
const getters: GetterTree<ToastState, RootState> = {}

type ToastAction<T, R = any> = TypedAction<ToastState, RootState, T, R>
type ToastParams = {content: string, type: 'notify' | 'warning', duration?: number}

/**
* Generate a new toast message, store it into state and render using Vue.toasted
*/
const toast: ToastAction<ToastParams, Toast> = async ({ commit, dispatch, state }, params) => {
  const toast = state.toasts
    .find(item => (item.content === params.content && item.type === params.type))

  if (!toast) {
    const id = uuidv4()
    const duration = params.duration || DEFAULT_DURATION
    const content = params.content
    const type = params.type || 'warning'

    /**
     * We create a toast using Vue.toasted, with infinite duration.
     *
     * Removal after the specified duration is handled by the store,
     * rather than by Vue.toasted.
     */
    const toastObj = Vue.toasted.show(params.content, {
      // type definitions specify duration as number | undefined
      // but null is how we achieve an infinite duration
      duration: null as unknown as undefined,
      type: type === 'notify' ? 'info' : 'error'
    })

    // On click remove the toast : default behavior was swipe
    toastObj.el.addEventListener('click', () => dispatch('remove', { id, delay: 100 }))

    const newToast: Toast = {
      content,
      changeText: toastObj.text,
      duration,
      goAway: toastObj.goAway,
      id,
      repeat: 1,
      type
    }

    commit('ADD_TOAST', newToast)

    await dispatch('remove', { id, delay: duration })

    return { data: newToast }
  } else {
    const { duration, id } = toast
    dispatch('remove', { id, delay: duration })
    commit('INCREASE_REPEAT', toast)

    return { data: toast }
  }
}

const notify: ToastAction<ToastParams, void> =
  ({ dispatch }, params) => dispatch('toast', { ...params, type: 'notify' })

/**
 * Show warning toast
 *
 * Wrapper for toast/toast action, which explicitly specifies type
 * @param {ToastParams} params
 */
const warning: ToastAction<ToastParams, void> =
  ({ dispatch }, params) => dispatch('toast', { ...params, type: 'warning' })

type RemoveParams = { id: string, delay: number }

/**
 * Remove a toast from state, after a specified delay
 *
 * Matches a toast in state by specified id and
 * schedules to remove it after the specified delay.
 *
 * If the toast is previously scheduled to remove,
 * that scheduling is cancelled and replaced with the new one.
 *
 * @param {RemoveParams} params
 * @param {string} params.id id of toast to remove
 * @param {number} params.delay delay to remove toast after
 */
const remove: ToastAction<RemoveParams, void> = ({ commit, state }, { id, delay }) => {
  const toast = state.toasts.find(t => t.id === id)
  if (!toast) { return }
  window.clearTimeout(toast.ref)

  /**
   * We use Vue.toasted, which, internally, uses anime.js for
   * - animation of the going away process
   * - onComplete callback then the process is over
   *
   * anime.js, in turn, uses window.requestAnimationFrame, which does not
   * behave acceptably when the tab is in background.
   *
   * Due to that, we cannot schedule `goAway` on a delay,
   * nor can we use the `onComplete` callback.
   *
   * Instead, we use window.setInterval to both destroy the toast immediately
   * and to remove it from store.
   */
  const ref = window.setTimeout(() => {
    if (toast.goAway) { toast.goAway(0) }
    commit('REMOVE_TOAST_BY_ID', id)
  }, delay)

  commit('UPDATE_REF', { toast, ref })
}

// actions
const actions: ActionTree<ToastState, RootState> = {
  toast,
  notify,
  warning,
  remove
}

type ToastMutation<T = void> = (state: ToastState, payload: T) => void

const ADD_TOAST: ToastMutation<Toast> = (state, toast) => {
  state.toasts.push(toast)
}

const REMOVE_TOAST_BY_ID: ToastMutation<string> = (state, id: string) => {
  const index = state.toasts.findIndex(t => t.id === id)
  if (index === -1) { return }
  state.toasts.splice(index, 1)
}

const INCREASE_REPEAT: ToastMutation<Toast> = (state, toast) => {
  const { content, changeText, repeat } = toast
  toast.repeat = repeat + 1
  changeText(`${content} (${toast.repeat})`)
}

const UPDATE_REF: ToastMutation<{toast: Toast, ref: number}> = (state, { toast, ref }) => {
  toast.ref = ref
}

const RESET_ALL: ToastMutation = (state) => {
  copyAttributes(state, getInitialState())
}

// mutations
const mutations: MutationTree<ToastState> = {
  ADD_TOAST,
  INCREASE_REPEAT,
  REMOVE_TOAST_BY_ID,
  RESET_ALL,
  UPDATE_REF
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}
