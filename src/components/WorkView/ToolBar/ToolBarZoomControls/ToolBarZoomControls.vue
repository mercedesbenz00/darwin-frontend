<template>
  <div class="zoom-controls">
    <icon-button
      v-tooltip="fitImageToScreenTooltip"
      class="zoom-controls__button zoom-controls__button__fit zoom-controls__button__fit--thin"
      size="small"
      color="transparent"
      @click="$emit('scale-to-fit')"
    >
      <span class="zoom-controls__button__fit__scale">
        {{ Math.round(100 * scale) }}%
      </span>
    </icon-button>
    <icon-button
      v-tooltip="zoomControlTooltip"
      class="zoom-controls__button zoom-controls__button__toggle"
      size="small"
      color="transparent"
      @click="onToggleZoom"
    >
      <component :is="iconTag" />
    </icon-button>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { State } from 'vuex-class'

import { IconButton } from '@/components/Common/Button/V2'
import { RESET_ZOOM_MODE } from '@/store/types'
import { TooltipOptions } from '@/types'

import { ZoomFixedIcon, ZoomResetIcon } from './assets/icons'

@Component({
  name: 'tool-bar-zoom-controls',
  components: { IconButton, ZoomFixedIcon, ZoomResetIcon }
})
export default class ZoomResetControl extends Vue {
  @Prop({ required: true, type: Number })
  scale!: number;

  @State(state => state.workview.resetZoomMode)
  resetZoomMode!: RESET_ZOOM_MODE;

  get iconTag (): string {
    return this.resetZoomMode === RESET_ZOOM_MODE.RESET
      ? 'zoom-reset-icon'
      : 'zoom-fixed-icon'
  }

  get fitImageToScreenTooltip (): TooltipOptions {
    return {
      content: 'Click to fit image to screen',
      placement: 'right',
      delay: { show: 300, hide: 0 }
    }
  }

  get zoomControlTooltip (): TooltipOptions {
    return {
      content: this.resetZoomMode === RESET_ZOOM_MODE.RESET
        ? 'Reset zoom when switching images'
        : 'Fixed zoom when switching images',
      placement: 'right',
      delay: { show: 300, hide: 0 }
    }
  }

  onToggleZoom (): void {
    this.$store.dispatch('workview/setResetZoomMode',
      this.resetZoomMode === RESET_ZOOM_MODE.RESET
        ? RESET_ZOOM_MODE.FIXED
        : RESET_ZOOM_MODE.RESET
    )
  }
}
</script>

<style lang="scss" scoped>
.zoom-controls {
  @include col--center;
  gap: 4px;

  &__button__fit,
  &__button__toggle {
    &__scale {
      @include typography(sm, inter, 400);
      color: rgb(31, 31, 31);
    }

    &:active,
    &:focus {
      background-color: transparent !important;
    }
  }

  &__button__fit--thin {
    max-height: 32px;
  }
}
</style>
