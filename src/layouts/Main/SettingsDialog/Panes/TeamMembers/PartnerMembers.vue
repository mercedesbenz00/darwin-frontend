<template>
  <div class="partner-members">
    <header-3>
      {{ `Members of ${partnerName}` }}
    </header-3>
    <read-only-member
      v-for="member in partnerMembers"
      :key="member.id"
      :member="member"
    />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { Getter, State } from 'vuex-class'

import Header3 from '@/components/Common/Header3.vue'
import { MembershipPayload, RootState, TeamPayload } from '@/store/types'

import ReadOnlyMember from './ReadOnlyMember.vue'
import { ROLE_ORDER } from './data'

/**
 * For the current team, assumed to be a client team, renders partner team
 * memberships.
 */
@Component({
  name: 'partner-members',
  components: { Header3, ReadOnlyMember }
})
export default class PartnerMembers extends Vue {
  /**
   * Computes and holds all the memberships of both current team and their partner
   */
  @Getter('relevantTeamMemberships', { namespace: 'team' })
  relevantMembers!: MembershipPayload[]

  /**
   * Holds the current team, assumed to be a client team
   */
  @State((state: RootState) => state.team.currentTeam)
  team!: TeamPayload

  /**
   * Returns partner members only, for the current client team
   */
  get partnerMembers (): MembershipPayload[] {
    if (!this.team.partner_id) { throw new Error('Team is not client') }
    const filtered = this.relevantMembers.filter(m => m.team_id === this.team.partner_id)

    return filtered.sort(
      (a: MembershipPayload, b: MembershipPayload) => ROLE_ORDER[a.role] - ROLE_ORDER[b.role]
    )
  }

  /**
   * Returns partner team name.
   */
  get partnerName (): string {
    if (!this.team.partner) { throw new Error('Team is not client') }
    return this.team.partner.name
  }
}
</script>

<style lang="scss" scoped>
.partner-members {
  @include col;
  row-gap: 20px;
}
</style>
