import { GetterTree, ActionTree, MutationTree, Module } from 'vuex'

import { BreadCrumb } from '@/mixins/BreadCrumbInitializer'
import { RootState } from '@/store/types'

export type UIState = {
  sidebarZIndex: number
  isSidebarFront: boolean
  sidebarMinimized: boolean
  showSettings: boolean
  currentSettingsTab: string
  breadCrumbs: BreadCrumb[]
  workerMode: boolean
  workviewBottomBarCollapsed: boolean
  workviewVideoFrameLineWidth: number
  workviewOverlayText: string | null
}

const getSavedSidebarMinimizedStatus = (): boolean => {
  const minimized = window.localStorage.getItem('sidebar_minimized') || 'false'
  return minimized === 'true'
}

export const getInitialState = (): UIState => ({
  sidebarZIndex: 999,
  isSidebarFront: true,
  sidebarMinimized: getSavedSidebarMinimizedStatus(),

  showSettings: false,
  currentSettingsTab: 'profile',
  breadCrumbs: [],

  workerMode: false,

  workviewBottomBarCollapsed: false,
  workviewVideoFrameLineWidth: 4,
  workviewOverlayText: null
})

const state: UIState = getInitialState()

// getters
const getters: GetterTree<UIState, RootState> = {
  isMobileOrTablet () {
    const userAgents = ['Android', 'iPad', 'iPhone']
    return userAgents.some(userAgent => navigator.userAgent.includes(userAgent))
  },

  tabletCompensation (state, getters): number {
    return getters.isMobileOrTablet ? 1.6 : 1
  }
}

// actions
const actions: ActionTree<UIState, RootState> = {
  /**
   * Put sidebar back
   */
  putBackSidebar ({ commit }) {
    commit('SET_SIDEBAR_Z_INDEX', 100)
    commit('SET_IS_SIDEBAR_FRONT', false)
  },

  /**
   * Bring sidebar to the front
   */
  bringFrontSidebar ({ commit }) {
    commit('SET_SIDEBAR_Z_INDEX', 999)
    commit('SET_IS_SIDEBAR_FRONT', true)
  },

  showSettingsDialog ({ commit }, { tab }) {
    commit('SET_SHOW_SETTINGS', true)
    if (tab) { commit('SET_CURRENT_SETTINGS_TAB', tab) }
  },

  hideSettingsDialog ({ commit }) {
    commit('SET_SHOW_SETTINGS', false)
  },

  /**
   * Save sidebar status
   */
  setSidebarStatus ({ commit }, minimized) {
    window.localStorage.setItem('sidebar_minimized', minimized ? 'true' : 'false')
    commit('SET_SIDEBAR_MINIMIZED', minimized)
  },

  reloadSidebarStatus ({ commit }) {
    commit('SET_SIDEBAR_MINIMIZED', getSavedSidebarMinimizedStatus())
  },

  setBreadCrumbs ({ commit }, crumbs) {
    commit('SET_BREAD_CRUMBS', crumbs)
  },

  loadWorkerMode ({ commit, rootGetters }) {
    const isFeatureEnabled =
      rootGetters['features/isFeatureEnabled'] as (feature: string) => boolean
    const enabled =
      isFeatureEnabled('WORKER_MODE_TOGGLE') &&
      new URLSearchParams(document.location.search).has('worker')

    commit('SET_WORKER_MODE', enabled)
  },

  toggleWorkerMode ({ commit, state }) {
    const enabled = !state.workerMode
    const url = new URL(window.location.toString())

    if (enabled) {
      url.searchParams.set('worker', '')
    } else {
      url.searchParams.delete('worker')
    }

    window.history.pushState({}, '', url)
    commit('SET_WORKER_MODE', enabled)
  }
}

// mutations
const mutations: MutationTree<UIState> = {
  SET_SIDEBAR_Z_INDEX (state, zIndex) {
    state.sidebarZIndex = zIndex
  },

  SET_IS_SIDEBAR_FRONT (state, isFront) {
    state.isSidebarFront = isFront
  },

  SET_SIDEBAR_MINIMIZED (state, minimized) {
    state.sidebarMinimized = minimized
  },

  SET_SHOW_SETTINGS (state, visibility) {
    state.showSettings = visibility
  },

  SET_CURRENT_SETTINGS_TAB (state, tab) {
    state.currentSettingsTab = tab
  },

  SET_BREAD_CRUMBS (state, crumbs: BreadCrumb[]) {
    state.breadCrumbs = crumbs
  },

  SET_WORKER_MODE (state, enabled: boolean) {
    state.workerMode = enabled
  },

  SET_WORKVIEW_BOTTOM_BAR_COLLAPSED (state, collapsed: boolean) {
    state.workviewBottomBarCollapsed = collapsed
  },

  SET_WORKVIEW_VIDEO_FRAME_LINE_WIDTH (state, lineWidth: number) {
    state.workviewVideoFrameLineWidth = lineWidth
  },

  SET_WORKVIEW_OVERLAY_TEXT (state, text: string | null) {
    state.workviewOverlayText = text
  }
}

const ui: Module<UIState, RootState> = {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}

export default ui
