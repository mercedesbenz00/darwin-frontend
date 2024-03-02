<template>
  <avatar
    v-if="membership"
    :id="membership.user_id"
    v-tooltip="name"
    class="key-owner"
    :name="name"
  />
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { State } from 'vuex-class'

import Avatar from '@/components/Common/Avatar/V1/Avatar.vue'
import { ApiKeyPayload } from '@/store/modules/apiKey/types'
import { MembershipPayload } from '@/store/types'

/**
 * Used to render an avatar of the user who created the API key.
 *
 * Uses standard avatar icon.
 */
@Component({ name: 'key-owner-avatar', components: { Avatar } })
export default class KeyOwnerAvatar extends Vue {
  @Prop({ required: true, type: Object })
  apiKey!: ApiKeyPayload

  @State(state => state.team.memberships)
  memberships!: MembershipPayload[]

  get membership (): MembershipPayload | null {
    return this.memberships.find(m => m.user_id === this.apiKey.user_id) || null
  }

  get name () {
    if (!this.membership) { return null }
    return [this.membership.first_name, this.membership.last_name].join(' ').trim()
  }
}
</script>

<style lang="scss" scoped>
.key-owner {
  cursor: pointer;
  user-select: none;
}
</style>
