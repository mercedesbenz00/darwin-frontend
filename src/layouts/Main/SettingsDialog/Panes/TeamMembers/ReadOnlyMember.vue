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
      <div
        class="member__role--fixed"
      >
        {{ roleLabels[member.role] }}
      </div>
    </div>
    <!-- we render a blank div here, to preserve the exact layout Member.vue has -->
    <div class="member__trash" />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import { TrashIconOld } from '@/assets/icons/V1'
import Avatar from '@/components/Common/Avatar/V1/Avatar.vue'
import { MembershipPayload } from '@/store/types'
import { getFullName } from '@/utils'

import { ROLE_LABELS } from './data'

/**
 * Used to render a team member line item in read-only mode, matching the same
 * layout defined in `Member.vue`
 */
@Component({ name: 'read-only-member', components: { Avatar, TrashIconOld } })
export default class ReadOnlyMember extends Vue {
  /**
   * The member this component will render
   */
  @Prop({ required: true })
  member!: MembershipPayload

  /**
   * Roles are corded as lowercase in the payload. This gives them a nicely
   * formatted text to render in UI
   */
  readonly roleLabels = ROLE_LABELS

  /**
   * From member's first and last name, computes a full name string
   */
  get fullName (): string {
    return getFullName(this.member)
  }

  /**
   * From associated member image, get's the appropriate url
   */
  get avatar (): string | null {
    return this.member.image && (this.member.image.thumbnail_url || this.member.image.url)
  }
}
</script>

<style src="./MemberBase.scss" lang="scss" scoped>
</style>
