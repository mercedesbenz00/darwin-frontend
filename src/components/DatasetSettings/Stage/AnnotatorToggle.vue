<template>
  <rounded-toggle-button
    class="stage-annotator"
    :selected="selected"
    @toggle="onClick"
  >
    <team-member-avatar
      class="stage-annotator__avatar"
      :member="member"
    />
    <span class="stage-annotator__name">{{ name }}</span>
  </rounded-toggle-button>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'

import TeamMemberAvatar from '@/components/Common/Avatar/V1/ResponsiveTeamMemberAvatar.vue'
import RoundedToggleButton from '@/components/Common/Button/V1/RoundedToggleButton.vue'
import { MembershipPayload } from '@/store/types'
import { getFullName } from '@/utils'

/**
 * Serves as a toggleable/selectable button when listing potential stage
 * assignees on an annotate or review stage.
 */
@Component({
  name: 'annotator-toggle',
  components: { RoundedToggleButton, TeamMemberAvatar }
})
export default class AnnotatorToggle extends Vue {
  @Prop({ required: true, type: Object as () => MembershipPayload })
  member!: MembershipPayload

  @Prop({ type: Boolean, default: false })
  selected!: boolean

  get name (): string {
    const { member } = this
    return getFullName(member)
  }

  onClick () {
    const { selected, member } = this
    const payload = member
      ? { id: member.user_id, selected: !selected }
      : { selected: !selected }
    this.$emit('select', payload)
  }
}
</script>

<style lang="scss" scoped>
.stage-annotator {
  display: grid;
  grid-template-columns: auto 1fr;
  column-gap: 8px;

  align-items: center;
  padding: 2px 3px;
}

.stage-annotator__avatar {
  width: 20px;
  height: 20px;
  border-radius: 50%;

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
}

.stage-annotator__name {
  @include typography(md);
  color: $colorSecondaryDark;
  text-align: left;
}
</style>
