<template>
  <div class="history-tools">
    <icon-button
      v-tooltip="undoTooltip"
      class="history-tools__button history-tools__button__undo"
      :class="{ clickable: canUndo }"
      color="transparent"
      size="small"
      :disabled="!canUndo"
      @click="$emit('undo')"
    >
      <undo-icon />
    </icon-button>
    <icon-button
      v-tooltip="redoTooltip"
      class="history-tools__button history-tools__button__redo"
      :class="{ clickable: canRedo }"
      color="transparent"
      size="small"
      flair="super-soft"
      :disabled="!canRedo"
      @click="$emit('redo')"
    >
      <redo-icon />
    </icon-button>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import { IconButton } from '@/components/Common/Button/V2'
import {
  RedoIcon,
  UndoIcon
} from '@/components/WorkView/TopBar/assets/icons'
import { TooltipOptions } from '@/types'

@Component({
  name: 'tool-bar-history-tools',
  components: {
    IconButton,
    RedoIcon,
    UndoIcon
  }
})
export default class ToolBarHistoryTools extends Vue {
  @Prop({ required: true, type: Boolean })
  canUndo!: boolean

  @Prop({ required: true, type: Boolean })
  canRedo!: boolean

  get undoTooltip (): TooltipOptions {
    return {
      content: '<b>Undo <span class=\'tooltip__hotkey\'>CTRL+Z</span></b>',
      placement: 'bottom',
      delay: { show: 300, hide: 300 }
    }
  }

  get redoTooltip (): TooltipOptions {
    return {
      content: '<b>Redo <span class=\'tooltip__hotkey\'>SHIFT+CTRL+Z</span></b>',
      placement: 'bottom',
      delay: { show: 300, hide: 300 }
    }
  }
}
</script>

<style lang="scss" scoped>
.history-tools {
  @include col--center;
  gap: 4px;

  &__button {
    &__undo,
    &__redo {
      &[disabled] {
        svg path {
          &:nth-of-type(1) {
            stroke: $colorContentDisabled;
          }

          &:nth-of-type(2) {
            fill: $colorContentDisabled;
          }
        }
      }
    }
  }
}
</style>
