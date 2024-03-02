<template>
  <div class="team-owner-invitations">
    <div class="team-owner-invitations__header">
      <h1>Team Owner Invitations</h1>
    </div>
    <team-owner-invitation-list />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

import TeamOwnerInvitationList from '@/components/Admin/TeamOwnerInvitations/TeamOwnerInvitationList.vue'

@Component({ components: { TeamOwnerInvitationList } })
export default class IndexView extends Vue {
  mounted () {
    this.$store.dispatch('admin/getTeamOwnerInvitations')
  }
}
</script>

<style lang="scss" scoped>
.team-owner-invitations {
  @include col;
  height: 100%;
  width: 100%;
  overflow: auto;
  padding: 0 50px;
}

.team-owner-invitations__header {
  margin: 30px 0;
}

.team-owner-invitations__header h1 {
  @include typography(lg-1, headlines, bold);
}
</style>
