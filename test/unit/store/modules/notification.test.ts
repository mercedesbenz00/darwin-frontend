import { createLocalVue } from '@vue/test-utils'
import { cloneDeep } from 'lodash'
import Vuex from 'vuex'

import { buildNotificationPayload } from 'test/unit/factories'

import notification from '@/store/modules/notification'
import { RootState } from '@/store/types'

const localVue = createLocalVue()
localVue.use(Vuex)

const notification1 = buildNotificationPayload({
  type: 'task_assigned',
  text: '<T5> in <D1> assigned.',
  team_id: 1,
  title: 'New Task Assigned',
  is_read: false,
  inserted_at: '2019-05-13T16:34:33',
  id: 1
})

const notification2 = buildNotificationPayload({
  type: 'task_assigned',
  text: '<T6> in <D1> assigned.',
  team_id: 1,
  title: 'New Task Assigned',
  is_read: false,
  inserted_at: '2019-05-13T16:38:18',
  id: 2
})

const notification3 = buildNotificationPayload({
  type: 'task_assigned',
  text: '<T7> in <D1> assigned.',
  team_id: 2,
  title: 'New Task Assigned',
  is_read: false,
  inserted_at: '2019-05-13T16:39:33',
  id: 3
})

const newStore = () => {
  const store = new Vuex.Store<RootState>({
    modules: {
      notification: { ...notification, state: cloneDeep(notification.state) }
    }
  })
  return store
}
describe('notification/BY_TEAM_UNREAD_COUNT', () => {
  it('sets byTeamUnreadCount', () => {
    const store = newStore()
    expect(store.state.notification.byTeamUnreadCount).toEqual({})

    store.commit('notification/BY_TEAM_UNREAD_COUNT', [[123, 2]])
    expect(store.state.notification.byTeamUnreadCount).toEqual({ 123: 2 })
  })

  it('removes unread count when team not in update list', () => {
    const store = newStore()
    store.commit('notification/BY_TEAM_UNREAD_COUNT', [[123, 2]])
    store.commit('notification/BY_TEAM_UNREAD_COUNT', [[124, 1]])
    expect(store.state.notification.byTeamUnreadCount).toEqual({ 124: 1 })
  })
})

describe('notification/ADD_NOTIFICATIONS', () => {
  it('adds unique notifications once', () => {
    const store = newStore()

    store.commit('notification/ADD_NOTIFICATIONS', [notification2, notification1])
    expect(Array.from(store.state.notification.notifications.keys())).toEqual([2, 1])

    store.commit('notification/ADD_NOTIFICATIONS', ([notification1, notification2]))
    expect(Array.from(store.state.notification.notifications.keys())).toEqual([2, 1])

    store.commit('notification/ADD_NOTIFICATIONS', [notification3])
    expect(Array.from(store.state.notification.notifications.keys())).toEqual([2, 1, 3])
  })

  it('sets sortedNotifications array in time descending order', () => {
    const store = newStore()

    store.commit('notification/ADD_NOTIFICATIONS', [notification2, notification1])
    store.commit('notification/ADD_NOTIFICATIONS', [notification3])
    expect(store.state.notification.sortedNotifications).toEqual([
      notification3,
      notification2,
      notification1
    ])
  })

  it('leaves haveAllPrevious false when list contains notifications', () => {
    const store = newStore()

    store.commit('notification/ADD_NOTIFICATIONS', [notification2, notification1])
    expect(store.state.notification.haveAllPrevious).toEqual(false)
  })

  it('sets haveAllPrevious true when notifications list is empty', () => {
    const store = newStore()

    store.commit('notification/ADD_NOTIFICATIONS', [])
    expect(store.state.notification.haveAllPrevious).toEqual(true)
  })
})

describe('notification/DELETE_NOTIFICATIONS', () => {
  it('deletes given notifications', () => {
    const store = newStore()

    store.commit('notification/ADD_NOTIFICATIONS', [notification2, notification1])
    store.commit('notification/ADD_NOTIFICATIONS', [notification3])
    expect(store.state.notification.sortedNotifications).toEqual([
      notification3,
      notification2,
      notification1
    ])

    store.commit('notification/DELETE_NOTIFICATIONS', [{ id: notification2.id }])
    expect(store.state.notification.sortedNotifications).toEqual([
      notification3,
      notification1
    ])

    store.commit('notification/DELETE_NOTIFICATIONS', [{ id: notification3.id }, { id: notification1.id }])
    expect(store.state.notification.sortedNotifications).toEqual([])
  })
})

describe('notification/CLEAR_NOTIFICATIONS', () => {
  it('resets state values', () => {
    const store = newStore()

    store.commit('notification/ADD_NOTIFICATIONS', [notification2, notification1])
    store.commit('notification/ADD_NOTIFICATIONS', [notification3])

    store.commit('notification/CLEAR_NOTIFICATIONS')
    expect(store.state.notification.sortedNotifications).toEqual([])
    expect(store.state.notification.byTeamUnreadCount).toEqual({})
    expect(store.state.notification.haveAllPrevious).toBe(false)
  })
})

describe('notification/MARK_READ', () => {
  it('marks notification is_read true', () => {
    const store = newStore()

    store.commit('notification/ADD_NOTIFICATIONS', [notification1])
    expect(store.state.notification.sortedNotifications[0].is_read).toBe(false)

    store.commit('notification/MARK_READ', notification1.id)
    expect(store.state.notification.sortedNotifications[0].is_read).toBe(true)
  })
})

describe('notification/SET_SOCKET_REF', () => {
  it('sets socket ref', () => {
    const store = newStore()

    expect(store.state.notification.socketRef).toBeNull()
    store.commit('notification/SET_SOCKET_REF', 1)
    expect(store.state.notification.socketRef).toEqual(1)
    store.commit('notification/SET_SOCKET_REF', 2)
    expect(store.state.notification.socketRef).toEqual(2)
  })
})

describe('notification/UNSET_SOCKET_REF', () => {
  it('unsets socket ref', () => {
    const store = newStore()

    expect(store.state.notification.socketRef).toBeNull()
    store.commit('notification/SET_SOCKET_REF', 1)
    expect(store.state.notification.socketRef).toEqual(1)
    store.commit('notification/UNSET_SOCKET_REF')
    expect(store.state.notification.socketRef).toBeNull()
  })
})
