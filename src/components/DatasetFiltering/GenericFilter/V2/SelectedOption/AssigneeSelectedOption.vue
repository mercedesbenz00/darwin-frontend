<template>
  <div class="assignee-selected-option">
    <responsive-team-member-avatar
      class="assignee-selected-option__avatar"
      :member="membership"
    />
    <span class="assignee-selected-option__name">{{ fullName }}</span>
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
import { getFullName } from '@/utils'

export default defineComponent({
  name: 'AssigneeSelectedOption',
  components: { ResponsiveTeamMemberAvatar },
  props: {
    option: {
      required: true,
      type: Object as PropType<GenericFilterOptionType>
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
.assignee-selected-option {
  width: 100%;
  display: grid;
  grid-template-columns: auto auto;
  grid-column-gap: 2px;
  align-items: center;

  &__avatar {
    width: 18px;
    height: 18px;
  }

  &__name {
    @include typography(md-1, inter, 500);
    @include ellipsis(1, md-1);
    overflow: hidden;
    color: $colorContentSecondary;
    text-align: left;
  }
}
</style>
