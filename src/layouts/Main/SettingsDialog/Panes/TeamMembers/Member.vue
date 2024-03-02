<template>
  <div class="member">
    <avatar
      :id="member.user_id"
      class="member__avatar"
      :name="fullName"
      :url="avatar"
    />
    <div class="member__name-section">
      <div class="member__name">
        {{ fullName }}
      </div>
      <div
        v-if="member.email"
        class="member__email"
      >
        {{ member.email }}
      </div>
    </div>
    <div class="member__role">
      <role-dropdown
        v-if="canUpdate"
        id="membership-role"
        name="membership-role"
        :value="member.role"
        :options="roleOptions"
        @change="onUpdate(member, $event)"
      />
      <div
        v-else
        class="member__role--fixed"
      >
        {{ roleLabels[member.role] }}
      </div>
    </div>
    <div class="member__trash">
      <div
        v-if="canDelete"
        @click="onDelete(member)"
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
import { MembershipPayload } from '@/store/types'
import { getFullName } from '@/utils'

import { ROLE_LABELS, membershipRoleOptions } from './data'

@Component({ name: 'member', components: { Avatar, RoleDropdown, TrashIconOld } })
export default class Member extends Vue {
  @Prop({ required: true })
  member!: MembershipPayload

  get roleOptions (): RoleDropdownOption[] {
    return membershipRoleOptions(this.$can)
  }

  readonly roleLabels = ROLE_LABELS

  get fullName () {
    return getFullName(this.member)
  }

  get avatar () {
    return this.member.image && (this.member.image.thumbnail_url || this.member.image.url)
  }

  get canUpdate (): boolean {
    const { member } = this
    return this.$can('update_membership', { subject: 'membership', resource: member })
  }

  onUpdate (membership: MembershipPayload, newRole: string) {
    this.$emit('update', { membership, newRole })
  }

  get canDelete (): boolean {
    const { member } = this
    return this.$can('delete_membership', { subject: 'membership', resource: member })
  }

  onDelete (membership: MembershipPayload) {
    this.$emit('delete', membership)
  }
}
</script>

<style src="./MemberBase.scss" lang="scss" scoped>
</style>
