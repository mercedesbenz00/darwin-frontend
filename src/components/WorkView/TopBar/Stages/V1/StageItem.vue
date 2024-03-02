<template>
  <div class="stage-item">
    <!-- wrap main slot in popover if hover slot given -->
    <v-popover
      v-if="$slots.hover"
      placement="bottom"
      trigger="hover"
      :delay="{ hide: 500 }"
      popover-class="stage-item-popover"
    >
      <slot name="main" />
      <template #popover>
        <slot name="hover" />
      </template>
    </v-popover>
    <!-- render main slot directly otherwise -->
    <slot
      v-else
      name="main"
    />
    <!-- assignment popover only in non complete stage and for team members or higher -->
    <template v-if="assignable">
      <v-popover
        class="dropdown"
        popover-class="stage-item-popover"
        placement="auto-start"
        trigger="click"
      >
        <assignment-dropdown-trigger class="dropdown__trigger" />
        <template #popover>
          <assignment-dropdown
            class="dropdown__content"
            :status="item.type"
            @assign="(member) => $emit('assign', member)"
          />
        </template>
      </v-popover>
    </template>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { State } from 'vuex-class'

import { DatasetPayload, StageType } from '@/store/types'

import AssignmentDropdown from './AssignmentDropdown.vue'
import AssignmentDropdownTrigger from './AssignmentDropdownTrigger.vue'

type ItemType = { type: string }

@Component({
  name: 'stage-item',
  components: { AssignmentDropdown, AssignmentDropdownTrigger }
})
export default class StageItem extends Vue {
  @Prop({ required: true, type: Object as () => ItemType })
  item!: ItemType

  @State(state => state.workview.dataset)
  dataset!: DatasetPayload

  @State(state => state.workview.tutorialMode)
  tutorialMode!: boolean

  get roleAssignable (): boolean {
    const { dataset } = this
    return this.$can(
      'assign_items',
      { subject: 'dataset', resource: dataset },
      ['workforce_manager']
    )
  }

  get typeAssignable (): boolean {
    const { item: { type } } = this
    return type === StageType.Annotate || type === StageType.Review
  }

  /**
   * Due to tutorial not currently supporting roles, we prevent assignment in
   * tutorial mode.
   *
   * Outside of that, item must by assignable by role, or by type.
   */
  get assignable (): boolean {
    const { roleAssignable, tutorialMode, typeAssignable } = this
    return (
      !tutorialMode && roleAssignable && typeAssignable
    )
  }
}
</script>
<style lang="scss" scoped>
.stage-item {
  position: relative;
  display: grid;
  align-items: center;
  justify-content: center;

  > * {
    grid-area: 1 / 1 / 2 / 2;
  }

  .dropdown {
    $trigger_size: 16px;

    overflow: visible;

    :deep(.trigger) {
      // overrides `display: inline-block` which is given by the popover component
      // as an inline style, causing whitespace issues
      display: grid !important;
    }

    right: 0;
    bottom: 0;

    align-self: end;
    justify-self: end;
    display: grid;
    align-items: end;
    justify-content: end;

    &__trigger {
      height: $trigger_size;
      width: $trigger_size;
      z-index: 1;
    }

    &__content {
      width: 100%;
    }
  }

  &:not(:hover) {
    .dropdown {
      display: none;
    }
  }

  &:hover {
    .dropdown {
      display: block;
    }
  }
}

/**
 * Popover content has a box shadow.
 * Default display property maxes the container grow with the shadow.
 * Flex prevents this.
 */
.v-popover {
  display: flex;
}
</style>

<!-- eslint-disable vue-scoped-css/enforce-style-type -->
<style lang="scss">
.stage-item-popover .popover-inner {
  top: 0;
  background: transparent;
  padding: 0;
}

.stage-item-popover .popover-arrow {
  display: none;
}
</style>
