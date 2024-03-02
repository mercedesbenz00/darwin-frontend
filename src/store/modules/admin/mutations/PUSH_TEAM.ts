import { AdminMutation, TeamPayload } from '@/store/modules/admin/types'

export const PUSH_TEAM: AdminMutation<TeamPayload> = (state, data) => {
  const index = state.teams.findIndex(t => t.id === data.id)
  if (index > -1) {
    state.teams.splice(index, 1, data)
  } else {
    state.teams.push(data)
  }
}
