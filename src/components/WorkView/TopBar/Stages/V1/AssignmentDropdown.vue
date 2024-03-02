<template>
  <div class="assignment">
    <button
      v-for="member in memberships"
      :key="member.id"
      class="member"
      :class="`member--${status}`"
      @click="$emit('assign', member)"
    >
      <status-button
        class="member__icon"
        :type="status"
      >
        <team-member-avatar :member="member" />
      </status-button>
      {{ member.first_name }} {{ member.last_name }}
    </button>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { Getter } from 'vuex-class'

import TeamMemberAvatar from '@/components/Common/Avatar/V1/ResponsiveTeamMemberAvatar.vue'
import StatusButton from '@/components/WorkView/Common/StatusButton/V1/StatusButton.vue'
import { MembershipPayload, DatasetItemStatus } from '@/store/types'

@Component({ name: 'assignment-dropdown', components: { StatusButton, TeamMemberAvatar } })
export default class AssignmentDropdown extends Vue {
  @Prop({ required: true, type: String as () => DatasetItemStatus })
  status!: DatasetItemStatus

  @Getter('relevantTeamMemberships', { namespace: 'team' })
  memberships!: MembershipPayload[]
}
</script>

<style lang="scss" scoped>
.assignment {
  @include col;
  align-items: center;
  height: 100%;
  width: 100%;
  border: 1px solid $colorAliceShade;
  border-radius: 3px;
  box-shadow: $shadowL;
  max-height: 70vh;
  overflow: auto;
}

.member {
  @include row;
  width: 100%;
  text-align: left;
  align-items: center;;
  background: transparent;
  background: $colorWhite;
  padding-top: 10px;
  padding-bottom: 10px;
  font-weight: bolder;
}

.member__icon {
  border-width: 2px;
}

.member:first-child {
  border-top-left-radius: 3px;
  border-top-right-radius: 3px;
}

.member:last-child {
  border-bottom-left-radius: 3px;
  border-bottom-right-radius: 3px;
}

.member:hover {
  background: $colorAliceShade;
}

.member__icon {
  margin-right: 10px;
}
</style>
