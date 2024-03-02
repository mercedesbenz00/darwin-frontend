import { Module, MutationTree, ActionTree } from 'vuex'

import { RootState, TypedMutation } from '@/store/types'
import { copyAttributes } from '@/utils'

import joinChannel from './workviewTracker/actions/joinChannel'
import leaveChannel from './workviewTracker/actions/leaveChannel'
import pause from './workviewTracker/actions/pause'
import reportActivity from './workviewTracker/actions/reportActivity'
import reportAutomationAction from './workviewTracker/actions/reportAutomationAction'
import reportModelTool from './workviewTracker/actions/reportModelTool'
import resolveChannel from './workviewTracker/actions/resolveChannel'
import unpause from './workviewTracker/actions/unpause'

export type WorkviewTrackerStatus = 'unjoined' | 'joined' | 'error'

export type WorkviewTrackerState = {
  timeInSeconds: number
  timer: null | number
  timerStatus: 'stopped' | 'started' | 'paused'
  topic: null | string
  /**
   * In workflows, there is no channel being joined until the item is assigned
   * or auto-self-assigned and there's a stage id.
   *
   * Due to that, when running clicker for the first time on an unassigned item,
   * it will not be able to report activity, since there's no stage-based topic
   * to report to.
   *
   * This issue is circumvented by setting this flag on the state.
   * When the channel is resolved and joined, if this flag is active, a single
   * workview:automation_action message will be sent.
   */
  pendingAutomationAction: boolean
  status: WorkviewTrackerStatus
}

export const getInitialState = (): WorkviewTrackerState => ({
  timeInSeconds: 0,
  timer: null,
  timerStatus: 'stopped',
  topic: null,
  pendingAutomationAction: false,
  status: 'unjoined'
})

const state: WorkviewTrackerState = getInitialState()

const actions: ActionTree<WorkviewTrackerState, RootState> = {
  resolveChannel,
  joinChannel,
  leaveChannel,
  reportAutomationAction,
  reportModelTool,
  reportActivity,

  toggleTimer ({ dispatch, state }) {
    return (state.timerStatus === 'paused')
      ? dispatch('unpause')
      : dispatch('pause')
  },

  pause,
  unpause
}

type WorkviewTrackerMutation<R = void> = TypedMutation<WorkviewTrackerState, R>

const SET_TOPIC: WorkviewTrackerMutation<string> = (state, topic: string) => {
  state.topic = topic
}

const SET_STATUS: WorkviewTrackerMutation<'joined'> = (state, status: 'joined') => {
  state.status = status
}

const SET_TIMER: WorkviewTrackerMutation<number> = (state, timer: number) => {
  if (state.timer) { window.clearInterval(state.timer) }
  state.timer = timer
}

const SET_TIME: WorkviewTrackerMutation<number> = (state, time: number) => {
  state.timeInSeconds = time
}

const SET_PENDING_AUTOMATION_ACTION: WorkviewTrackerMutation = (state) => {
  state.pendingAutomationAction = true
}

const CLEAR_TIMER_REF: WorkviewTrackerMutation = (state) => {
  if (state.timer) { window.clearInterval(state.timer) }
  state.timer = null
}

const START_TIMER: WorkviewTrackerMutation = (state) => {
  CLEAR_TIMER_REF(state)
  state.timerStatus = 'started'
}

const PAUSE_TIMER: WorkviewTrackerMutation = (state) => {
  if (state.timerStatus !== 'started') { return }
  CLEAR_TIMER_REF(state)
  state.timerStatus = 'paused'
}

const UNPAUSE_TIMER: WorkviewTrackerMutation = (state) => {
  if (state.timerStatus !== 'paused') { return }
  START_TIMER(state)
}

const STOP_TIMER: WorkviewTrackerMutation = (state) => {
  CLEAR_TIMER_REF(state)
  state.timerStatus = 'stopped'
}

const INCREMENT_TIMER: WorkviewTrackerMutation = (state) => {
  state.timeInSeconds += 1
}

const RESET_ALL: WorkviewTrackerMutation = (state: WorkviewTrackerState) => {
  if (state.timer) { window.clearInterval(state.timer) }
  copyAttributes(state, getInitialState())
}

const mutations: MutationTree<WorkviewTrackerState> = {
  INCREMENT_TIMER,
  PAUSE_TIMER,
  RESET_ALL,
  SET_PENDING_AUTOMATION_ACTION,
  SET_STATUS,
  SET_TIME,
  SET_TIMER,
  SET_TOPIC,
  START_TIMER,
  STOP_TIMER,
  UNPAUSE_TIMER
}

const workviewTracker: Module<WorkviewTrackerState, RootState> = {
  namespaced: true,
  state,
  actions,
  mutations
}

export default workviewTracker
