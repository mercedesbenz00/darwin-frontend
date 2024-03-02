import { AuthAction } from '@/store/modules/auth/types'
import { Socket } from '@/utils'

type LogoutStore = AuthAction<{}, void>

export const logoutStore: LogoutStore = async ({ commit, dispatch }) => {
  await dispatch('notification/leaveNotificationsChannel', null, { root: true })
  commit('SET_AUTHENTICATED', false)
  commit('SET_ABILITIES', [])
  await Socket.disconnect()
}
