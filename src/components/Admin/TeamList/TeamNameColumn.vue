<template>
  <div class="team-name">
    <div class="team-name__top">
      <router-link :to="`teams/${team.id}`">
        {{ team.name }}
      </router-link>
      <partner-pill
        v-if="isPartner"
        class="team-name__top__pill"
      />
    </div>
    <div class="team-name__bottom">
      ({{ team.slug }})
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import PartnerPill from '@/components/PartnerTeam/PartnerPill.vue'
import { TeamPayload } from '@/store/modules/admin/types'

@Component({
  name: 'team-name-column',
  components: { PartnerPill }
})
export default class TeamNameColumn extends Vue {
  @Prop({ required: true, type: Object as () => TeamPayload })
  team!: TeamPayload

  get isPartner (): boolean {
    return this.team.managed_status === 'partner'
  }
}
</script>

<style lang="scss" scoped>
.team-name {
  display: grid;
  grid-template-areas: "top"
                       "bottom";
}

.team-name__top {
  grid-area: top;
  @include row;
  gap: 10px;
}

.team-name__bottom {
  grid-area: bottom;
}

.team-name__top__pill {
  align-self: start;
}
</style>
