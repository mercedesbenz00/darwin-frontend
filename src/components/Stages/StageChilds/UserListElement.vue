<template>
  <assignable-list-item
    :selected="selected"
    v-bind="$attrs"
    v-on="$listeners"
  >
    <template #icon>
      <team-member-avatar :member="member" />
    </template>
    <template #label>
      {{ name }}
    </template>
  </assignable-list-item>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'

import TeamMemberAvatar from '@/components/Common/Avatar/V2/TeamMemberAvatar.vue'
import AssignableListItem from '@/components/Stages/StageChilds/AssignableListItem.vue'
import { MembershipPayload } from '@/store/types/MembershipPayload'
import { getFullName } from '@/utils'

export default defineComponent({
  name: 'UserListElement',
  components: {
    TeamMemberAvatar,
    AssignableListItem
  },
  props: {
    member: { type: Object as () => MembershipPayload, required: true },
    selected: { type: Boolean, required: false, default: false }
  },
  setup (props) {
    const name = computed(() => getFullName(props.member))
    return { name }
  }
})
</script>
