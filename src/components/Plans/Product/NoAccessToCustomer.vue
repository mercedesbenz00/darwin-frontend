<template>
  <div
    v-if="currentTeam && owner"
    class="no-access-to-customer"
  >
    <p>
      Sorry, you are not authorized to manage this team's billing.
      Please ask an Admin or the Team Owner.
      {{ currentTeam.name }}'s owner is <strong>{{ ownerFullName }}</strong>.
    </p>
    <p>
      Team Owners and Admins are notified of any billing changes or credit
      expiries automatically by email.
    </p>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { State } from 'vuex-class'

import { RootState, TeamPayload } from '@/store/types'
import { getFullName } from '@/utils'

@Component({
  name: 'no-access-to-customer'
})
export default class NoAccessToCustomer extends Vue {
  @State((state: RootState) => state.team.currentTeam)
  currentTeam!: TeamPayload | null

  get owner () {
    if (!this.currentTeam) { return }
    return this.currentTeam.members.find(member => ['admin', 'owner'].includes(member.role))
  }

  get ownerFullName () {
    if (!this.owner) { return '' }
    return getFullName(this.owner)
  }
}
</script>

<style lang="scss" scoped>
.no-access-to-customer {
  width: 100%;
  height: 100%;
  overflow: hidden;
  @include typography(md-1);
  padding-top: 20%;
  text-align: center;

  p:not(:last-child) {
    margin-bottom: 20px;
  }

  strong {
    font-weight: bold;
  }
}
</style>
