<template>
  <div
    role="button"
    class="team-item"
    :class="isCurrent ? 'team-item--current' : 'team-item--other'"
    @click="$emit('click')"
  >
    <team-avatar
      class="team-item__avatar"
      :team="team"
    />
    <div class="team-item__team">
      <div class="team-item__team__name">
        {{ team.name }}
      </div>
      <partner-pill
        v-if="isPartner"
        class="team-item__team__pill"
      />
      <div
        v-if="isCurrent"
        class="team-item__team__members"
      >
        {{ memberCount }} team members
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { Getter, State } from 'vuex-class'

import TeamAvatar from '@/components/Common/Avatar/V1/TeamAvatar.vue'
import PartnerPill from '@/components/PartnerTeam/PartnerPill.vue'
import { MembershipPayload, TeamPayload } from '@/store/types'

@Component({ name: 'team-item', components: { TeamAvatar, PartnerPill } })
export default class TeamItem extends Vue {
  @Prop({ required: true, type: Object as () => TeamPayload })
  team!: TeamPayload

  @Getter('membershipsForTeam', { namespace: 'team' })
  memberships!: (team: TeamPayload) => MembershipPayload[]

  @State(state => state.team.currentTeam)
  currentTeam!: TeamPayload | null

  get isCurrent (): boolean {
    return this.team.id === (!!this.currentTeam && this.currentTeam.id)
  }

  get memberCount (): number | null {
    return this.isCurrent
      ? this.memberships(this.team).length
      : null
  }

  get isPartner (): boolean {
    return this.team.managed_status === 'partner'
  }
}
</script>

<style lang="scss" scoped>
.team-item:hover {
  background: #CCF4F0;
  cursor: pointer;
}

.team-item {
  @include row--center;
  column-gap: 10px;
  align-items: center;
  padding: 10px 16px;
}

.team-item__avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

.team-item__avatar :deep(.avatar__icon) {
  border-radius: 50%;
}

.team-item__team {
  display: grid;
  grid-auto-flow: row;
  grid-template-columns: 1fr;
  width: calc(100% - 54px);
  justify-content: start;
}

.team-item__team__name {
  @include ellipsis(2, md-1);
  word-break: break-all;
  font-family: $fontFamilyDefault;
  color: $colorSecondaryDark1;

  grid-row: 1 / 2;
}

.team-item__team .team-item__team__pill {
  grid-row: 1 / 2;

  align-self: start;
  justify-self: end;
}

.team-item--other .team-item__team__name {
  @include ellipsis(1, md-1);
  font-family: $fontFamilyDefault;
  color: $colorSecondaryDark1;
}

.team-item__team__members {
  @include typography(md-1, headlines);
  color: $colorSecondaryLight;
  grid-row: 2 / 3;
}
</style>
