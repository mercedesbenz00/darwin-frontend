import Vue from 'vue'
import { GetterTree, ActionTree, MutationTree } from 'vuex'

import { NotificationMessagePayload, NotificationPayload, RootState } from '@/store/types'
import { Socket, copyAttributes, parseError, Channel, isErrorResponse } from '@/utils'

const util = require('util')

export type NotificationState = {
  notifications: Map<number, NotificationPayload>
  sortedNotifications: NotificationPayload[]
  haveAllPrevious: boolean
  byTeamUnreadCount: { [teamId: number]: number },
  socketRef: null | number
}

export const getInitialState = (): NotificationState => ({
  notifications: new Map(),
  sortedNotifications: [],
  haveAllPrevious: false,
  byTeamUnreadCount: {},
  socketRef: null
})

const state: NotificationState = getInitialState()

const compareInsertedAt = (a: NotificationPayload, b: NotificationPayload): number => {
  if (a.inserted_at === b.inserted_at) {
    return 0
  }
  if (a.inserted_at < b.inserted_at) {
    return 1
  }
  return -1
}

const getters: GetterTree<NotificationState, RootState> = {
  notifications (state) { return state.sortedNotifications },
  notificationsForTeam (state, getters, rootState) {
    const { currentTeam } = rootState.team
    if (!currentTeam) { return [] }
    const teamNotifications = state.sortedNotifications.filter((n) => n.team_id === currentTeam.id)
    return [...teamNotifications].sort((a, b) => {
      if (a.is_read === b.is_read) { return compareInsertedAt(a, b) }
      return a.is_read ? 1 : -1
    })
  },

  unreadCountForTeam (state, getters, rootState) {
    const { currentTeam } = rootState.team
    if (!currentTeam) { return 0 }
    return state.byTeamUnreadCount[currentTeam.id] ? state.byTeamUnreadCount[currentTeam.id] : 0
  },

  displayCount (state, getters) {
    if (getters.unreadCountForTeam > 99) {
      // only enough room for a double digit number
      return '99'
    } else if (getters.unreadCountForTeam > 0) {
      return getters.unreadCountForTeam
    }
    return ''
  }
}

const topicName = (state: RootState): string | null =>
  state.user.profile ? `notifications:${state.user.profile.id}` : null

const getChannel = (state: RootState): Promise<{ channel: Channel }> => {
  const topic = topicName(state)
  if (!topic) { throw new Error('Unable to resolve notifications channel') }
  return Socket.connectAndJoin(topic)
}

const actions: ActionTree<NotificationState, RootState> = {
  async joinNotificationsChannel ({ commit, rootState }) {
    let response

    try {
      response = await getChannel(rootState)
    } catch (error: unknown) {
      if (!isErrorResponse(error)) { throw error }
      return parseError(error)
    }

    const { channel } = response

    if (state.socketRef) {
      channel.off('notifications', state.socketRef)
      commit('UNSET_SOCKET_REF')
    }

    const socketRef = channel.on('notifications', (payload: NotificationMessagePayload) => {
      const {
        notifications,
        deleted_notifications: deletedNotifications,
        by_team_unread_count: byTeamUnreadCount
      } = payload

      if (notifications) {
        commit('ADD_NOTIFICATIONS', notifications)
      }

      if (deletedNotifications) {
        commit('DELETE_NOTIFICATIONS', deletedNotifications)
      }

      if (byTeamUnreadCount) {
        commit('BY_TEAM_UNREAD_COUNT', byTeamUnreadCount)
      }
    })

    commit('SET_SOCKET_REF', socketRef)
  },

  async moreNotifications ({ state, rootState }) {
    // if (state.haveAllPrevious) { return }
    try {
      const sortedRead = state.sortedNotifications.filter(n => n.is_read)
      const oldestRead = sortedRead[sortedRead.length - 1]
      const sortedUnread = state.sortedNotifications.filter(n => !n.is_read)
      const oldestUnread = sortedUnread[sortedUnread.length - 1]

      const payload = {
        before_read_id: oldestRead ? oldestRead.id : null,
        before_unread_id: oldestUnread ? oldestUnread.id : null
      }

      if (!oldestRead && !oldestUnread) { return }

      const { channel } = await getChannel(rootState)
      if (channel) {
        channel.push('notifications', payload)
      } else {
        console.error('moreNotifications', 'channel not found')
      }
    } catch (e: unknown) {
      console.error('moreNotifications', util.inspect(e))
    }
  },

  async markNotificationRead ({ commit, rootState }, id) {
    try {
      const { channel } = await getChannel(rootState)
      if (channel) {
        channel.push('notifications:read', { id: id })
        commit('MARK_READ', id)
      } else {
        console.error('markNotificationRead', 'channel not found')
      }
    } catch (e: unknown) {
      console.error('markNotificationRead', util.inspect(e))
    }
  },

  async leaveNotificationsChannel ({ commit, rootState }) {
    const topic = topicName(rootState)
    if (!topic) { return }
    await Socket.leave(topic)
    commit('CLEAR_NOTIFICATIONS')
  }
}

const resort = (notifications: NotificationState['notifications']): NotificationPayload[] =>
  Array
    .from(notifications.values())
    .sort(compareInsertedAt)

const mutations: MutationTree<NotificationState> = {
  ADD_NOTIFICATIONS (state, notifications: NotificationPayload[]) {
    if (notifications.length === 0) {
      state.haveAllPrevious = true
    }
    notifications.forEach(n => state.notifications.set(n.id, n))
    const sorted = resort(state.notifications)
    Vue.set(state, 'notifications', state.notifications)
    Vue.set(state, 'sortedNotifications', sorted)
  },

  DELETE_NOTIFICATIONS (state, notifications: NotificationPayload[]) {
    const toDelete = notifications.filter(n => state.notifications.has(n.id))
    if (toDelete.length > 0) {
      toDelete.forEach(n => state.notifications.delete(n.id))
      const sorted = resort(state.notifications)
      Vue.set(state, 'notifications', state.notifications)
      Vue.set(state, 'sortedNotifications', sorted)
    }
  },

  CLEAR_NOTIFICATIONS (state) {
    Vue.set(state, 'notifications', new Map())
    Vue.set(state, 'sortedNotifications', [])
    Vue.set(state, 'byTeamUnreadCount', {})
    state.haveAllPrevious = false
  },

  BY_TEAM_UNREAD_COUNT (state, list: [number, number][]) {
    const map: NotificationState['byTeamUnreadCount'] = {}
    list.forEach(([teamId, count]) => map[teamId] = count) // eslint-disable-line
    Vue.set(state, 'byTeamUnreadCount', map)
  },

  MARK_READ (state, id: number) {
    const notification = state.notifications.get(id)
    if (!notification) { return }

    notification.is_read = true
    state.notifications.set(id, notification)
    const sorted = resort(state.notifications)
    Vue.set(state, 'notifications', state.notifications)
    Vue.set(state, 'sortedNotifications', sorted)
  },

  SET_SOCKET_REF (state, ref) {
    state.socketRef = ref
  },

  UNSET_SOCKET_REF (state) {
    state.socketRef = null
  },

  RESET_ALL (state: NotificationState) {
    copyAttributes(state, getInitialState())
  }
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}
