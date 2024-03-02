<template>
  <div
    class="assignment"
    v-click-outside="onClose"
  >
    <icon-button
      v-tooltip="tooltip"
      class="assignment__trigger"
      color="transparent"
      flair="rounded"
      @click="onOpen"
    >
      <icon-duotone-trigger />
    </icon-button>
    <popup-menu
      v-if="open"
      class="popup-menu popup-menu-stage-item"
      :class="{ 'popup-menu--open': open }"
      :style="style"
    >
      <list-element-v2
        v-for="(member, idx) in memberships"
        :key="member.id"
        :id="member.id"
        class="assignment__item"
        :class="`assignment__item--${status}`"
        :selected="selectedIdx === idx"
        @click="$emit('assign', member)"
      >
        <status-button
          class="assignment__item__icon"
          :type="status"
        >
          <team-member-avatar :member="member" />
        </status-button>
        <span class="assignment__item__label">
          {{ member.first_name }} {{ member.last_name }}
        </span>
      </list-element-v2>
    </popup-menu>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import { Getter } from 'vuex-class'

import { IconDuotoneTrigger } from '@/assets/icons/V2/Duotone'
import TeamMemberAvatar from '@/components/Common/Avatar/V1/ResponsiveTeamMemberAvatar.vue'
import { IconButton } from '@/components/Common/Button/V2'
import ListElementV2 from '@/components/Common/ListElements/ListElementV2/ListElementV2.vue'
import PopupMenu from '@/components/Common/PopupMenu/V2/PopupMenu.vue'
import StatusButton from '@/components/WorkView/Common/StatusButton/V1/StatusButton.vue'
import { AssignmentDropdownProps } from '@/components/WorkView/TopBar/Stages/V2'
import { MembershipPayload, DatasetItemStatus } from '@/store/types'
import { TooltipOptions } from '@/types'
import { getIdNext } from '@/utils'

@Component({
  name: 'assignment-dropdown',
  components: {
    IconButton,
    ListElementV2,
    PopupMenu,
    StatusButton,
    TeamMemberAvatar,
    IconDuotoneTrigger
  }
})
export default class AssignmentDropdown extends Vue {
  @Prop({ required: true, type: String as () => DatasetItemStatus })
  status!: AssignmentDropdownProps['status']

  @Prop({ type: Object as () => MembershipPayload })
  assignee!: MembershipPayload | null

  @Getter('relevantTeamMemberships', { namespace: 'team' })
  memberships!: MembershipPayload[]

  open: boolean = false
  selectedIdx: number = 0
  nudgeRight = 0

  @Watch('assignee', { immediate: true })
  onAssignee (): void {
    this.selectedIdx = this.memberships.findIndex(m => m.id === this.assignee?.id)
  }

  get tooltip (): TooltipOptions {
    return {
      content: `Assign ${this.status}`,
      delay: { show: 300, hide: 300 }
    }
  }

  get style (): Partial<{ [key in keyof CSSStyleDeclaration]: string }> {
    return {
      left: `${this.nudgeRight}px`
    }
  }

  mounted (): void {
    this.registerEventListener()
    this.$once('hook:beforeDestroy', () => this.destroyEventListener())
  }

  private registerEventListener (): void {
    document.addEventListener('keydown', this.onKeyDown)
  }

  private destroyEventListener (): void {
    document.removeEventListener('keydown', this.onKeyDown)
  }

  checkNudgeRight (): void {
    const { $theme, $parent: { $refs: { 'stage-item': stageItem } } } = this
    if (!stageItem) { return }
    try {
      const rect = (stageItem as any).getBoundingClientRect()
      const menuWidth = 230 * $theme.getCurrentScale()
      this.nudgeRight = rect.right < (window.innerWidth - menuWidth)
        ? rect.right - (menuWidth / 2)
        : window.innerWidth - menuWidth
    } catch (err: unknown) {
      console.error(err)
    }
  }

  // on key down, if the popup menu list is focused,
  // navigate through the filtered items
  onKeyDown (event: KeyboardEvent): void {
    const INCREASE = [39, 40]
    const DECREASE = [37, 38]
    const CLOSE = [9, 13, 27]
    const { keyCode } = event
    if ([...INCREASE, ...DECREASE, ...CLOSE].includes(keyCode)) {
      event.preventDefault()
      event.stopPropagation()
      if ([...INCREASE, ...DECREASE].includes(keyCode)) {
        const { selectedIdx, memberships } = this
        const newId = getIdNext(selectedIdx, memberships.length, INCREASE.includes(keyCode))
        this.selectedIdx = newId
        this.$emit('input', memberships[newId])
      } else if (CLOSE.includes(keyCode)) {
        this.onClose()
      }
    }
  }

  onOpen (): void {
    setTimeout(() => {
      this.$emit(this.open ? 'close' : 'open')
      this.open = !this.open
      this.checkNudgeRight()
    }, 100)
  }

  onClose (): void {
    setTimeout(() => {
      this.$emit('close')
      this.open = false
    }, 100)
  }
}
</script>

<!-- eslint-disable-next-line vue-scoped-css/enforce-style-type -->
<style lang="scss">
.popup-menu-stage-item {
  .menu__wrapper {
    @include col;
  }
}
</style>

<style lang="scss" scoped>
$size: 12px;
$overlap: 2px;
$popup-width: 230px;
$min-popup-height: 30px;
$max-popup-height: 420px;

.assignment {
  position: absolute;
  @include col;
  align-items: center;
  height: 100%;
  width: 100%;
  right: -#{$overlap * 3};
  top: calc(100% - #{$size - $overlap});
  border-radius: 3px;

  &__trigger {
    max-height: $size;
    max-width: $size;
    overflow: hidden;
    z-index: 2;
  }

  .popup-menu {
    display: none;
    @include col;
    justify-content: space-between;
    position: fixed;
    top: 50px;
    margin: 0;
    padding: 0;
    width: $popup-width;
    height: auto;
    min-height: $min-popup-height;
    max-height: $max-popup-height;
    background-color: $colorWhite;
    z-index: 1;
    @include scrollbarV2;

    &--open {
      display: block;
    }
  }

  &__item {
    @include row;
    align-items: center;
    height: 32px;

    &:deep(.list-element__content) {
      gap: 8px;
    }

    &__icon {
      height: 24px;
      width: 24px;
    }
  }
}
</style>
