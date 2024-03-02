<template>
  <div
    v-if="membership"
    class="hide-by-author-item"
    :class="{ 'hide-by-author-item--selected': selected }"
    @click="$emit('click')"
  >
    <div class="hide-by-author-item__details">
      <team-member-avatar
        class="hide-by-author-item__avatar"
        :member="membership"
        :size="20"
      />
      <span class="hide-by-author-item__name">
        {{ fullName }}
      </span>
    </div>

    <span class="hide-by-author-item__count">
      {{ count }}
    </span>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { Getter } from 'vuex-class'

import TeamMemberAvatar from '@/components/Common/Avatar/V1/TeamMemberAvatar.vue'
import { AnnotationActorPayload, MembershipPayload } from '@/store/types'
import { getFullName } from '@/utils'

@Component({
  name: 'hide-by-author-item',
  components: { TeamMemberAvatar }
})
export default class HideByAuthorItem extends Vue {
  @Prop({ required: true })
  actor!: AnnotationActorPayload

  @Prop({ required: true })
  count!: number

  @Prop({ default: false, type: Boolean })
  selected!: boolean

  @Getter('relevantTeamMemberships', { namespace: 'team' })
  memberships!: MembershipPayload[]

  get membership () {
    return this.memberships.find(membership => membership.user_id === this.actor.user_id)
  }

  get fullName () {
    if (!this.membership) { return '' }
    return getFullName(this.membership)
  }
}
</script>

<style lang="scss" scoped>
.hide-by-author-item {
  @include row--distributed--center;
  @include noSelect;
  border-radius: 13px;
  padding: 3px 10px 3px 7px;
  border: 1px solid transparent;
  transition: background-color .2s;
  cursor: pointer;

  &:hover {
    border: 1px solid $colorAliceBlue;
    background-color: $colorAliceShade;
    transition: none;
  }

  &:active {
    border: 1px solid $colorAliceShade;
    background-color: $colorAliceShade;
    transition: none;
  }
}

.hide-by-author-item--selected {
  border: 1px solid $colorAliceNight;
  background-color: $colorAliceShadow;

  &:hover, &:active {
    border: 1px solid $colorAliceNight;
    background-color: $colorAliceShadow;
  }
}

.hide-by-author-item__details {
  @include row--center;
  overflow: hidden;
}

.hide-by-author-item__avatar {
  margin-right: 3px;
}

.hide-by-author-item__name {
  flex: 1 1 auto;
  @include typography(md);
  text-align: left;
  color: $colorSecondaryDark1;
  padding: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.hide-by-author-item__count {
  @include typography(sm, default, bold);
  color: $colorAliceNight;
  text-align: right;
}
</style>
