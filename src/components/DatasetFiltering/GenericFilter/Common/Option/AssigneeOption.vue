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
import { Component, Prop, Vue } from 'vue-property-decorator'

import ResponsiveTeamMemberAvatar from '@/components/Common/Avatar/V1/ResponsiveTeamMemberAvatar.vue'
import { GenericFilterOptionType } from '@/components/DatasetFiltering/GenericFilter'
import { MembershipPayload } from '@/store/types'
import { getFullName } from '@/utils'

@Component({
  name: 'assignee-option',
  components: { ResponsiveTeamMemberAvatar }
})
export default class AssigneeOption extends Vue {
  @Prop({ required: true })
  option!: GenericFilterOptionType

  get membership (): MembershipPayload {
    return this.option.data as MembershipPayload
  }

  get fullName (): string {
    return getFullName(this.membership)
  }
}
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
    @include typography(md, mulish);
    @include ellipsis(1, md);
    overflow: hidden;
    color: $color90Black;
    text-align: left;
  }
}
</style>
