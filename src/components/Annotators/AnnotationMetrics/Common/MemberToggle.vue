<template>
  <button
    v-tooltip="tooltip"
    class="toggle"
    :class="{'toggle--selected': selected}"
    @click="$emit('click', $event)"
  >
    <team-member-avatar
      :key="member.id"
      class="toggle__avatar"
      :member="member"
    />
    <span
      v-if="label"
      class="toggle__name"
    >{{ name }}</span>
  </button>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'

import TeamMemberAvatar from '@/components/Common/Avatar/V1/ResponsiveTeamMemberAvatar.vue'
import { MembershipPayload } from '@/store/types'
import { getFullName } from '@/utils'

@Component({ name: 'member-toggle', components: { TeamMemberAvatar } })
export default class MemberToggle extends Vue {
  @Prop({ required: true, type: Object })
  member!: MembershipPayload

  @Prop({ required: false, default: true, type: Boolean })
  label!: boolean

  @Prop({ required: true, type: Boolean })
  selected!: boolean

  @Prop({ required: false, default: false, type: Boolean })
  multiselect!: boolean

  get name (): string {
    return getFullName(this.member)
  }

  get tooltip (): string {
    const name = this.member.first_name
    if (!this.multiselect) { return `Click to show stats for ${name}.` }
    return this.selected
      ? `Click to remove ${name} from chart. Shift-click to only show ${name}.`
      : `Click to add ${name} to chart. Shift-click to only show ${name}.`
  }
}
</script>

<style lang="scss" scoped>
.toggle {
  opacity: 0.3;
  @include row;
  align-items: center;
  background: transparent;
  transition: opacity .2s ease;
}

.toggle__avatar {
  height: 35px;
  width: 35px;
}

.toggle:hover {
  opacity: 0.5;
}

.toggle--selected {
  opacity: 1;
}

.toggle__name {
  margin-left: 10px;
  font-weight: bold;
}
</style>
