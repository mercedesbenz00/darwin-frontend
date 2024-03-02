<template>
  <div class="assignee-option">
    <responsive-team-member-avatar
      class="assignee-option__avatar"
      :member="membership"
    />
    <span class="assignee-option__name">{{ fullName }}</span>
  </div>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  PropType,
  Ref
} from 'vue'

import ResponsiveTeamMemberAvatar from '@/components/Common/Avatar/V1/ResponsiveTeamMemberAvatar.vue'
import { GenericFilterOptionType } from '@/components/DatasetFiltering/GenericFilter'
import { MembershipPayload } from '@/store/types'
import { getFullName, TriToggleStatus } from '@/utils'

export default defineComponent({
  name: 'AssigneeOption',
  components: { ResponsiveTeamMemberAvatar },
  props: {
    option: {
      required: true,
      type: Object as PropType<GenericFilterOptionType>
    },
    status: {
      required: false,
      type: String as () => TriToggleStatus,
      default: 'none'
    }
  },
  setup (props) {
    const membership: Ref<MembershipPayload> = computed(() => {
      return props.option.data as MembershipPayload
    })

    const fullName: Ref<string> = computed(() => {
      return getFullName(membership.value)
    })

    return {
      fullName,
      membership
    }
  }
})
</script>

<style lang="scss" scoped>
.assignee-option {
  width: 100%;
  display: grid;
  grid-template-columns: auto 1fr;
  grid-column-gap: 5px;
  align-items: center;

  &__avatar {
    height: 18px;
    width: 18px;
  }

  &__name {
    @include typography(md-1, inter, 500);
    color: $colorContentDefault;
    @include ellipsis(1, md-1);
    overflow: hidden;
    text-align: left;
  }
}
</style>
