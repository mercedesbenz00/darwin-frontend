<template>
  <settings-pane title="Team Members">
    <template #body>
      <invite-form />
      <div class="members__body">
        <div
          v-if="sortedInvitations.length > 0"
          class="members__invitations members__list"
        >
          <header-3>Pending Invitations</header-3>
          <div>
            <invitation
              v-for="invitation in sortedInvitations"
              :key="`invitation-${invitation.id}`"
              :invitation="invitation"
              class="members__member"
              @update="updateInvitation"
              @delete="deleteInvitation"
            />
          </div>
        </div>

        <div
          v-if="canManageNonAnnotators"
          class="members__memberships members__list"
        >
          <header-3>Team</header-3>
          <div>
            <member
              v-for="member in sortedMembers"
              :key="`member-${member.id}`"
              :member="member"
              class="members__member"
              @update="updateMembership"
              @delete="deleteMembership"
            />
          </div>
        </div>

        <div
          v-if="sortedAnnotators.length > 0"
          class="members__annotators members__list"
        >
          <header-3>Workers</header-3>
          <div>
            <member
              v-for="member in sortedAnnotators"
              :key="`annotator-${member.id}`"
              :member="member"
              class="members__member"
              @update="updateMembership"
              @delete="deleteMembership"
            />
          </div>
        </div>

        <partner-members v-if="isClient" />
      </div>
    </template>
    <template #footer />

    <delete-confirmation-dialog
      ref="deleteMembershipConfirmationDialog"
      name="delete-membership-modal"
      :title="`Please confirm you wish to remove ${memberToDeleteName} from the team.`"
      detail="Removing a user from the team can only by undone by inviting them back."
      button-text="REMOVE FROM TEAM"
      @confirmed="deleteMembershipConfirmed"
    />
    <delete-confirmation-dialog
      ref="deleteInvitationConfirmationDialog"
      name="delete-invitation-modal"
      :title="deleteInvitationTitle"
      :detail="deleteInvitationDetail"
      button-text="CANCEL INVITATION"
      @confirmed="deleteInvitationConfirmed"
    />
    <confirmation-dialog
      ref="transferOwnershipConfirmationDialog"
      name="transfer-ownership-modal"
      :title="transferOwnershipTitle"
      :detail="transferOwnershipDetail"
      confirm-text="Confirm"
      @confirmed="transferOwnershipConfirmed"
    />
  </settings-pane>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, ref } from 'vue'

import ConfirmationDialog from '@/components/Common/ConfirmationDialog.vue'
import { DeleteConfirmationDialog } from '@/components/Common/DeleteConfirmationDialog/V1'
import Header3 from '@/components/Common/Header3.vue'
import { useAuth } from '@/composables/useAuth'
import { useStore } from '@/composables/useStore'
import { useTeamStore } from '@/composables/useTeamStore'
import SettingsPane from '@/layouts/Main/SettingsDialog/Panes/SettingsPane.vue'
import { InvitationPayload, MembershipPayload, MembershipRole } from '@/store/types'
import { getFullName } from '@/utils'

import Invitation from './Invitation.vue'
import InviteForm from './InviteForm.vue'
import Member from './Member.vue'
import PartnerMembers from './PartnerMembers.vue'
import { ROLE_LABELS, ROLE_ORDER } from './data'

export default defineComponent({
  name: 'TeamMembers',
  components: {
    ConfirmationDialog,
    DeleteConfirmationDialog,
    Header3,
    Invitation,
    InviteForm,
    Member,
    PartnerMembers,
    SettingsPane
  },
  setup () {

    const store = useStore()
    const teamStore = useTeamStore()

    const sortedMembers = computed(() => {
      const sortedMembers =
        teamStore.currentTeamMemberships.value
          .filter(member => ['member', 'admin', 'owner'].some(r => r === member.role))
          .sort((a, b) => ROLE_ORDER[a.role] - ROLE_ORDER[b.role])
      return sortedMembers
    })

    const sortedAnnotators = computed(() =>
      teamStore.currentTeamMemberships.value.filter(
        member => member.role === 'annotator' || member.role === 'workforce_manager'
      )
    )

    const sortedInvitations = computed(
      () => store.state.team.invitations
        .filter(i => i.team_id === store.state.team.currentTeam?.id)
        .sort((a, b) => ROLE_ORDER[a.role] - ROLE_ORDER[b.role])
    )

    const roleLabels = ROLE_LABELS

    const { isAuthorized } = useAuth()

    const canManageNonAnnotators = computed<boolean>(() =>
      isAuthorized('update_membership', { subject: 'membership', resource: { role: 'member' } })
    )

    onMounted(() => {
      store.dispatch('team/getMemberships')
      if (isAuthorized('view_invitations')) {
        store.dispatch('team/getInvitations')
      }
    })

    const memberToDelete = ref<MembershipPayload | null>(null)

    const deleteMembershipConfirmationDialog = ref<DeleteConfirmationDialog | null>(null)

    const memberToDeleteName = computed<string | null>(
      () => memberToDelete.value && getFullName(memberToDelete.value) || null
    )

    const deleteMembership = (member: MembershipPayload): void => {
      memberToDelete.value = member
      deleteMembershipConfirmationDialog.value?.show()
    }

    const deleteMembershipConfirmed = async (): Promise<void>  => {
      const membership = memberToDelete.value
      if (!membership) { return }
      deleteMembershipConfirmationDialog.value?.close()

      await teamStore.deleteMembershipById(membership.id)

      memberToDelete.value = null
    }

    const memberToTransferOwnershipTo = ref<MembershipPayload>()

    const memberToTransferOwnershipToName = computed<string | undefined>(() =>
      memberToTransferOwnershipTo.value && getFullName(memberToTransferOwnershipTo.value)
    )

    const transferOwnershipTitle = computed<string>(() =>
      `Transfer team ownership to ${memberToTransferOwnershipToName.value}?`
    )

    const transferOwnershipDetail = computed<string>(() => {
      const subject = memberToTransferOwnershipToName.value || 'This user'
      return [
        `${subject} will become responsible for the team's billing,`,
        'and will be able to invite and remove admins. Be careful when transferring ownership!'
      ].join(' ')
    })

    const transferOwnershipConfirmationDialog = ref<ConfirmationDialog | null>(null)

    const transferOwnershipConfirmed = async (): Promise<void> => {
      transferOwnershipConfirmationDialog.value?.close()

      if (!memberToTransferOwnershipTo.value) { return }
      const result =
    await teamStore.updateMembershipRole(memberToTransferOwnershipTo.value.id, 'owner')

      if (!result.success) {
        return
      }

      store.dispatch('auth/loginWithToken')
      store.dispatch('toast/notify', { content: 'Ownership successfully transferred' })

      memberToTransferOwnershipTo.value = undefined
    }

    const updateMembership = async (
      params: { membership: MembershipPayload, newRole: MembershipRole }
    ): Promise<void> => {
      const { membership, newRole } = params
      if (!newRole || newRole === membership.role) { return }
      if (newRole === 'owner') {
        memberToTransferOwnershipTo.value = membership
        transferOwnershipConfirmationDialog.value?.show()
        return
      }

      await teamStore.updateMembershipRole(params.membership.id, params.newRole)
    }

    const invitationToDelete = ref<InvitationPayload | null>(null)

    const deleteInvitationTitle = computed<string>(() => {
      const email = invitationToDelete.value?.email
      return email
        ? `Please confirm you wish to cancel the invitation sent to ${email}.`
        : 'Please confirm you wish to cancel this invitation.'
    })

    const deleteInvitationDetail = [
      'This will prevent the user from clicking the invitation link',
      'they got in the email and joining the team.'
    ].join(' ')

    const deleteInvitationConfirmationDialog = ref<DeleteConfirmationDialog | null>(null)

    const deleteInvitation = (invitation: InvitationPayload): void => {
      invitationToDelete.value = invitation
      deleteInvitationConfirmationDialog.value?.show()
    }

    const deleteInvitationConfirmed = async (): Promise<void> => {
      deleteInvitationConfirmationDialog.value?.close()

      if (!invitationToDelete.value) { return }
      await teamStore.deleteInvitationById(invitationToDelete.value.id)

      invitationToDelete.value = null
    }

    const updateInvitation = async (
      params: { invitation: InvitationPayload, newRole: InvitationPayload['role'] }
    ): Promise<void> => {
      await teamStore.updateInvitationRole(params.invitation, params.newRole)
    }

    return {
      canManageNonAnnotators,
      isClient: teamStore.currentTeamIsClient,
      roleLabels,
      // manage invitations
      deleteInvitation,
      deleteInvitationConfirmationDialog,
      deleteInvitationConfirmed,
      deleteInvitationDetail,
      deleteInvitationTitle,
      updateInvitation,
      // manage members
      deleteMembership,
      deleteMembershipConfirmationDialog,
      deleteMembershipConfirmed,
      memberToDelete,
      memberToDeleteName,
      transferOwnershipConfirmationDialog,
      transferOwnershipConfirmed,
      transferOwnershipDetail,
      transferOwnershipTitle,
      updateMembership,
      // listing
      sortedAnnotators,
      sortedInvitations,
      sortedMembers
    }

  }
})
</script>

<style lang="scss" scoped>
.members__body {
  width: 100%;
  flex: 1;
  @include col;
  padding-left: 12px;
  padding-right: 84px;
  overflow: auto;
}

.members__list {
  @include col;
  row-gap: 20px;
  margin-bottom: 15px;
}

.members__member {
  padding-bottom: 13px;
  margin-bottom: 13px;
  width: 100%;

  &:last-child {
    margin-bottom: 0;
  }
}

.members__memberships,
.members__annotators,
.members__invitations {
  @include col;
  width: 100%;
}

</style>
