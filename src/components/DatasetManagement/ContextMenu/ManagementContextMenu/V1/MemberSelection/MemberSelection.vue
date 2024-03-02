<template>
  <div class="member-selection">
    <div class="member-selection__list">
      <div class="member-selection__list__content">
        <div
          v-for="member of filteredMemberships"
          :key="member.id"
          v-close-popover
          class="member-selection-item"
          @click="$emit('select', member)"
        >
          <responsive-team-member-avatar
            class="member-selection-item__avatar"
            :member="member"
          />
          <span class="member-selection-item__name">{{ getFullName(member) }}</span>
        </div>
      </div>
    </div>
    <input-field
      v-model="search"
      class="member-selection__search"
      placeholder="Search Annotators"
    />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { Getter } from 'vuex-class'

import ResponsiveTeamMemberAvatar from '@/components/Common/Avatar/V1/ResponsiveTeamMemberAvatar.vue'
import InputField from '@/components/Common/InputField/V1/InputField.vue'
import { MembershipPayload } from '@/store/types'
import { getFullName } from '@/utils'

@Component({
  name: 'member-selection',
  components: { InputField, ResponsiveTeamMemberAvatar }
})
export default class MemberSelection extends Vue {
  @Getter('relevantTeamMemberships', { namespace: 'team' })
  memberships!: MembershipPayload[]

  search: string = ''

  getFullName = getFullName

  get filteredMemberships (): MembershipPayload[] {
    if (!this.search) { return this.memberships }
    return this.memberships
      .filter(member => getFullName(member).match(new RegExp(this.search, 'i')))
  }
}
</script>

<style lang="scss" scoped>

.member-selection {
  max-height: 50vh;
  @include col;
  overflow: hidden;
  padding: 0;
}

.member-selection__list {
  flex: 1;
  padding-top: 7px;
  overflow-y: auto;
}

.member-selection__list__content {
  flex: 1;
  @include col;
  overflow-y: auto;
}

.member-selection-item {
  width: 100%;
  @include row--center;
  overflow: hidden;
  padding: 7px 9px;
  cursor: pointer;

  column-gap: 9px;

  &:hover {
    background: $colorAliceBlue;
  }

}

.member-selection-item__avatar {
  height: 20px;
  width: 20px;
}

.member-selection-item__avatar :deep(.avatar__icon) {
  border: 1px solid $colorAssignedBlue;
}

.member-selection-item__avatar :deep(.avatar__badge) .avatar__icon {
  border: none;
}

.member-selection-item__name {
  flex: 1;
  @include ellipsis(1, md);
  @include typography(md);
  color: $color90Black;
}

.member-selection__search {
  width: calc(100% - 10px);
  margin: 5px 5px 7px;

  :deep(input) {
    @include typography(md);

    &::placeholder {
      @include typography(md);
    }
  }
}
</style>
