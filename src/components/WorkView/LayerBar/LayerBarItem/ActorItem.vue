<template>
  <v-popover
    :delay="100"
    placement="top"
    trigger="hover"
  >
    <team-member-avatar
      class="actor-item__avatar"
      :member="actor"
      :size="20"
    />

    <template #popover>
      {{ fullName }}
    </template>
  </v-popover>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import TeamMemberAvatar from '@/components/Common/Avatar/V2/TeamMemberAvatar.vue'
import { MembershipPayload } from '@/store/types'
import { getFullName } from '@/utils'

@Component({
  name: 'actor-item',
  components: { TeamMemberAvatar }
})
export default class ActorItem extends Vue {
  @Prop({ required: true })
  actor!: MembershipPayload

  get fullName () {
    return getFullName(this.actor)
  }
}
</script>

<style lang="scss" scoped>
.actor-item__avatar {
  :deep(.avatar__icon) {
    border: 1px solid $colorAssignedBlue;
  }
}
</style>
