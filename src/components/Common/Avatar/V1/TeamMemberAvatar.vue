<template>
  <avatar
    :id="member.user_id"
    :name="name"
    :url="url"
    :size="size"
  >
    <template
      v-if="partner"
      #badge
    >
      <team-avatar :team="partner" />
    </template>
  </avatar>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { State } from 'vuex-class'

import { MembershipPayload, RootState, TeamPayload } from '@/store/types'
import { getFullName } from '@/utils'

import Avatar from './Avatar.vue'
import TeamAvatar from './TeamAvatar.vue'

@Component({ name: 'team-member-avatar', components: { Avatar, TeamAvatar } })
export default class TeamMemberAvatar extends Vue {
  @Prop({ required: true, type: Object })
  member!: MembershipPayload

  @Prop({ required: false, default: 35, type: Number })
  size!: number

  get url (): string | null {
    return this.member.image?.thumbnail_url || this.member.image?.url || null
  }

  get name (): string {
    return getFullName(this.member)
  }

  @State((state: RootState) => state.team.currentTeam)
  team!: TeamPayload

  get partner (): TeamPayload | null {
    if (this.member.team_id !== this.team.partner_id) { return null }
    if (this.team.managed_status !== 'client') { return null }
    return this.team.partner
  }
}
</script>
