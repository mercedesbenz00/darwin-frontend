<template>
  <status-button
    class="instance"
    :class="{'instance--selected': isSelected}"
    :type="instance.type"
    inverted
    @click="$emit('click')"
  >
    <team-member-avatar
      v-if="assignee"
      class="instance__avatar"
      :member="assignee"
    />
  </status-button>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { Getter, State } from 'vuex-class'

import TeamMemberAvatar from '@/components/Common/Avatar/V1/ResponsiveTeamMemberAvatar.vue'
import StatusButton from '@/components/WorkView/Common/StatusButton/V2/StatusButton.vue'
import { MembershipPayload, WorkflowStagePayload } from '@/store/types'

@Component({ name: 'stage-instance', components: { StatusButton, TeamMemberAvatar } })
export default class StageInstance extends Vue {
  @Prop({ required: true, type: Object as () => WorkflowStagePayload })
  instance!: WorkflowStagePayload

  @State(state => state.workview.selectedStageInstance)
  selectedInstance!: WorkflowStagePayload | null

  get isSelected (): boolean {
    const { instance, selectedInstance } = this
    return !!selectedInstance && selectedInstance.id === instance.id
  }

  @Getter('relevantTeamMemberships', { namespace: 'team' })
  memberships!: MembershipPayload[]

  get assignee (): MembershipPayload | null {
    const { instance, memberships } = this
    return memberships.find(m => m.user_id === instance.assignee_id) || null
  }
}
</script>
<style lang="scss" scoped>
.instance {
  border-width: 2px;
}

.instance.status-button,
.instance:hover.status-button {
  @include workflow-status-background-color;
  color: $colorWhite;
}

</style>
