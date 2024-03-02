import { computed } from 'vue'

import { addInvitations } from '@/store/modules/team/actions/addInvitations'
import { deleteInvitation } from '@/store/modules/team/actions/deleteInvitation'
import { deleteMembership } from '@/store/modules/team/actions/deleteMembership'
import { updateMembership } from '@/store/modules/team/actions/updateMembership'
import { getRelevantTeamMemberships } from '@/store/modules/team/getters/relevantTeamMemberships'
import {
  InvitationPayload,
  MembershipPayload,
  MembershipRole,
  StoreActionPayload,
} from '@/store/types'

import { useStore } from './useStore'

/**
 * Serves as a typed composition API wrapper around the team store
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const useTeamStore = () => {
  const store = useStore()

  const currentTeam = computed(() => store.state.team.currentTeam)

  const currentTeamIsClient =
    computed<boolean>(() => currentTeam.value?.managed_status === 'client')

  const allRelevantMemberships = computed(() => getRelevantTeamMemberships(store.state.team))
  const currentTeamMemberships = computed(
    () => allRelevantMemberships.value.filter(m => m.team_id === store.state.team.currentTeam?.id)
  )

  const deleteMembershipById =
    async (membershipId: MembershipPayload['id']): Promise<void> => {
      const payload: StoreActionPayload<typeof deleteMembership> = { id: membershipId }
      const { error } = await store.dispatch('team/deleteMembership', payload)

      if (error) {
        store.dispatch('toast/warning', { content: error.message })
        return
      }
      store.dispatch('toast/notify', { content: 'Member successfully removed' })
    }

  const updateMembershipRole = async (
    membershipId: MembershipPayload['id'],
    newRole: MembershipPayload['role']
  ): Promise<{ success: boolean }> =>{

    const payload: StoreActionPayload<typeof updateMembership> = {
      id: membershipId,
      role: newRole
    }

    const { error } = await store.dispatch('team/updateMembership', payload)

    if (error) {
      const content = (error.isValidationError && error?.role)
        ? error.role
        : error.message
      store.dispatch('toast/warning', { content })
      return { success: false }
    }

    return { success: true }
  }

  const createInvitation = async (
    email: string,
    role: MembershipRole
  ): Promise<void | { email?: string, role?: string }> => {
    if (!currentTeam.value) { return }
    const params: StoreActionPayload<typeof addInvitations> = {
      teamId: currentTeam.value.id,
      invitations: [{ email, role }]
    }

    const response = await store.dispatch('team/addInvitations', params)

    if ('error' in response) {
      if ('isValidationError' in response.error) {
        return {
          email: response.error.email,
          role: response.error.role
        }
      }
      return
    }

    store.dispatch('toast/notify', { content: 'Invitation successfully sent' })
  }

  const deleteInvitationById = async (invitationId: InvitationPayload['id']): Promise<void> => {
    const payload: StoreActionPayload<typeof deleteInvitation> = { id: invitationId }
    const { error } = await store.dispatch('team/deleteInvitation', payload)

    if (error) {
      store.dispatch('toast/warning', { content: error.message })
      return
    }
    store.dispatch('toast/notify', { content: 'Invitation successfully revoked' })
  }

  const updateInvitationRole =
    async (invitation: InvitationPayload, newRole: InvitationPayload['role']): Promise<void> => {
      const { error } = await store.dispatch('team/updateInvitation', {
        id: invitation.id,
        role: newRole,
        email: invitation.email
      })

      if (error) {
        store.dispatch('toast/warning', { content: error.message })
      }
    }

  return {
    allRelevantMemberships,
    currentTeam,
    currentTeamIsClient,
    // memberships
    currentTeamMemberships,
    deleteMembershipById,
    updateMembershipRole,
    // invites
    createInvitation,
    deleteInvitationById,
    updateInvitationRole
  }
}
