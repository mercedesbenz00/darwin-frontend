<template>
  <popover
    :show="show"
    placeholder="Search annotators"
    :input-value="searchValue"
    @on-input="(val) => searchValue = val"
  >
    <template #left-icon>
      <icon-duotone-search />
    </template>
    <div class="popover-assign">
      <list-element-v2
        v-for="(member, index) in searchResults"
        :key="index"
        :text="name(member)"
        @click="$emit('assign', member)"
      >
        <template #prefix>
          <team-member-avatar :member="member" />
        </template>
      </list-element-v2>
    </div>
  </popover>
</template>

<script lang="ts">
import Vue from 'vue'
import { Component, Prop } from 'vue-property-decorator'
import { Getter } from 'vuex-class'

import { IconDuotoneSearch } from '@/assets/icons/V2/Duotone'
import TeamMemberAvatar from '@/components/Common/Avatar/V2/TeamMemberAvatar.vue'
import ListElementV2 from '@/components/Common/ListElements/ListElementV2/ListElementV2.vue'
import Popover
  from '@/components/DatasetManagement/ContextMenu/ManagementContextMenu/V2/Popover/Popover.vue'
import AnyoneIcon from '@/components/Stages/StageChilds/anyone.svg?inline'
import { searchByNameV2 } from '@/components/Stages/utils'
import { MembershipPayload } from '@/store/types'
import { getFullName } from '@/utils'

/**
 * @Component ContextMenuPopoverAssign
 * ~ The popover component will emit an function on member click which will return either 'anyone'
 * or the MembershipPayload object
 * @param {string} show
 * */

@Component({
  name: 'context-menu-popover-assign',
  components: {
    ListElementV2,
    Popover,
    IconDuotoneSearch,
    TeamMemberAvatar,
    AnyoneIcon
  }
})
export default class ContextMenuPopoverAssign extends Vue {
  searchValue: string = ''

  @Getter('relevantTeamMemberships', { namespace: 'team' })
  memberships!: MembershipPayload[]

  @Prop({ type: Boolean, default: false })
  show!: boolean

  get searchResults (): MembershipPayload[] {
    const { memberships, searchValue } = this
    return searchByNameV2(memberships, searchValue)
  }

  name (member: MembershipPayload): string {
    return getFullName(member)
  }
}
</script>

<style lang="scss" scoped>
.popover-assign {
  display: block;
  padding: 2px;
}
</style>
