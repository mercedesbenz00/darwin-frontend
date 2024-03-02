<template>
  <responsive-avatar
    :id="team.id"
    class="team-item__avatar"
    :url="avatarUrl"
    :name="teamName"
  />
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import { TeamPayload } from '@/store/types'

import ResponsiveAvatar from './ResponsiveAvatar.vue'

@Component({
  name: 'team-avatar',
  components: { ResponsiveAvatar }
})
export default class TeamAvatar extends Vue {
  @Prop({ required: true, type: Object as () => TeamPayload })
  team!: TeamPayload

  get avatarUrl (): string | null {
    return this.team.image?.thumbnail_url || this.team.image?.url || null
  }

  get teamName (): string {
    return this.team.name
  }
}
</script>

<style lang="scss" scoped>

</style>
