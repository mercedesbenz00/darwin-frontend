<template>
  <div
    ref="model-selection-dropdown-item"
    tabindex="1"
    class="model__dropdown__item"
    :class="{
      ['model__dropdown__item--active']: selected
    }"
    autofocus
    @click="$emit('submit')"
  >
    <div class="model__dropdown__item__col">
      <v2-model-icon
        v-if="type"
        class="model__dropdown__item__icon"
        :model-type="type"
      />
    </div>
    <div class="model__dropdown__item__col">
      <span
        v-tooltip="tooltip"
        class="model__dropdown__item__label"
      >
        {{ option.label }}
      </span>
      <span class="model__dropdown__item__classes">
        <badges
          v-if="classes"
          :items="classes"
          :selected="selected"
        />
      </span>
    </div>
    <div class="model__dropdown__item__col">
      <status
        class="model__dropdown__item__status"
        :value="'active'"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import { Badges } from '@/components/Common/Badge'
import { Status } from '@/components/Common/Status'
import {
  ModelSelectionDropdownOption,
  ModelSelectionDropdownClassOption,
  V2ModelIcon
} from '@/components/WorkView/ToolModelSelection/ModelSelectionDropdown/V2'
import { TooltipOptions } from '@/types'

@Component({
  name: 'v2-model-selection-dropdown-item',
  components: {
    V2ModelIcon,
    Badges,
    Status
  }
})
export default class V2ModelSelectionDropdownItem extends Vue {
  @Prop({ required: true, type: Object })
  option!: ModelSelectionDropdownOption

  @Prop({ type: Boolean, default: false })
  selected!: boolean

  get type (): string {
    if (!this.option) { return '' }
    return this.option?.type || ''
  }

  get label (): string {
    if (!this.option) { return '' }
    return this.option?.label || ''
  }

  get classes (): ModelSelectionDropdownClassOption[] {
    if (!this.option) { return [] }
    const classes: ModelSelectionDropdownClassOption[] = this.option?.classes
    return classes
  }

  get status (): boolean {
    if (!this.option) { return false }
    return true
  }

  get tooltip (): TooltipOptions {
    return {
      placement: 'bottom',
      content: this.label,
      delay: { show: 300, hide: 300 }
    }
  }
}
</script>

<style lang="scss" scoped>
.model__dropdown__item {
  @include row;
  align-items: center;
  height: 64px;
  max-width: 100%;
  padding: 6px;
  border-radius: 8px;

  &:hover:not(.model__dropdown__item--active) {
    background-color: $colorOverlayHover;
  }

  &--active {
    background-color: $colorOverlayInteractive;
  }

  &:focus,
  &:active {
    outline: none;
  }

  &__col {
    @include col;
    align-items: flex-start;
    height: 100%;

    > div {
      min-height: 50%;
    }

    &:nth-child(2) {
      justify-content: space-around;
      flex: 1 1 auto;
    }

    &:nth-child(2),
    &:nth-child(3) {
      margin-left: 8px;
    }
  }

  &__label {
    @include ellipsis(1, md);
    @include typography(md, default, bold);
    max-width: 200px;
  }

  &__classes {
    @include row;
    width: 100%;
  }

  &__status {
    @include col;
  }
}
</style>
