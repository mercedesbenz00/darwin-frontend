<template>
  <avatar
    v-if="team"
    :id="team.id"
    v-tooltip="name"
    class="key-team"
    :name="name"
  />
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { State } from 'vuex-class'

import Avatar from '@/components/Common/Avatar/V1/Avatar.vue'
import { ApiKeyPayload } from '@/store/modules/apiKey/types'
import { TeamPayload } from '@/store/types'

/**
 * Used to render an avatar of the team the API key is associated with.
 *
 * Uses standard avatar icon.
 */
@Component({ name: 'key-owner-avatar', components: { Avatar } })
export default class KeyOwnerAvatar extends Vue {
  @Prop({ required: true, type: Object })
  apiKey!: ApiKeyPayload

  @State(state => state.team.teams)
  teams!: TeamPayload[]

  get team (): TeamPayload | null {
    return this.teams.find(t => t.id === this.apiKey.team_id) || null
  }

  get name () {
    if (!this.team) { return null }
    return this.team.name
  }
}
</script>

<style lang="scss" scoped>
.key-team {
  cursor: pointer;
  user-select: none;
}
</style>
