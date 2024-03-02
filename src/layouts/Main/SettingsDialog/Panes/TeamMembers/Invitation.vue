<template>
  <div class="member">
    <avatar
      :id="invitation.email"
      class="member__avatar"
      :name="invitation.email"
    />
    <div class="member__name-section">
      <div class="member__name">
        Invitation Sent
      </div>
      <div
        v-if="invitation.email"
        class="member__email"
      >
        {{ invitation.email }}
      </div>
    </div>
    <div class="member__role">
      <role-dropdown
        v-if="canManageInvitation"
        id="invitation-role"
        name="invitation-role"
        :value="role"
        :options="roleOptions"
        @change="onUpdate(invitation, $event)"
      />
      <div
        v-else
        class="member__role--fixed"
      >
        {{ roleLabel }}
      </div>
    </div>
    <div class="member__trash">
      <div
        v-if="canManageInvitation"
        @click="onDelete(invitation)"
      >
        <trash-icon-old class="member__trash_icon" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import { TrashIconOld } from '@/assets/icons/V1'
import Avatar from '@/components/Common/Avatar/V1/Avatar.vue'
import RoleDropdown from '@/components/Common/RoleDropdown.vue'
import { RoleDropdownOption } from '@/components/Common/RoleDropdownOption'
import { InvitationPayload } from '@/store/types'

import { ROLE_LABELS, invitationRoleOptions } from './data'

@Component({ name: 'invitation', components: { Avatar, RoleDropdown, TrashIconOld } })
export default class Invitation extends Vue {
  @Prop({ required: true })
  invitation!: InvitationPayload

  get roleOptions (): RoleDropdownOption[] {
    return invitationRoleOptions(this.$can)
  }

  roleLabels = ROLE_LABELS

  get role () {
    return this.invitation.role
  }

  get roleLabel () {
    return this.roleLabels[this.role]
  }

  get canManageInvitation (): boolean {
    const { invitation } = this
    return this.$can('manage_invitations', { subject: 'invitation', resource: invitation })
  }

  onUpdate (invitation: InvitationPayload, newRole: string) {
    this.$emit('update', { invitation, newRole })
  }

  onDelete (invitation: InvitationPayload) {
    this.$emit('delete', invitation)
  }
}
</script>

<style lang="scss" scoped>
@import './MemberBase.scss';
</style>
