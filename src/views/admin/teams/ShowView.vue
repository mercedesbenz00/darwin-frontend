<template>
  <team-details
    v-if="team"
    :team="team"
  />
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { State } from 'vuex-class'

import TeamDetails from '@/components/Admin/TeamDetails/TeamDetails.vue'
import { TeamPayload } from '@/store/modules/admin/types'

@Component({ name: 'admin-show-view', components: { TeamDetails } })
export default class ShowView extends Vue {
  @State(state => state.admin.teams)
  teams!: TeamPayload[]

  async mounted () {
    const { error } = await this.$store.dispatch('admin/getTeam', this.$route.params.teamId)
    if (error) {
      return this.$store.dispatch('toast/warning', { content: error.message })
    }
  }

  get team (): TeamPayload | null {
    if (!this.$route.params.teamId) { throw new Error('Invalid access to /admin/teams/:id') }
    const teamId = parseInt(this.$route.params.teamId)
    return this.teams.find(t => t.id === teamId) || null
  }
}
</script>
