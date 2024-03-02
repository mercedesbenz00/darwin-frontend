<template>
  <div
    v-tooltip="tooltip"
    class="workview-image"
    :class="{
      'workview-image--selected selected': selected,
      'workview-image--is-video': isVideo
    }"
  >
    <!-- vue-virtual-scroller docs recommend setting :key on
    nested <img> elements to avoid glitches -->
    <img
      :key="thumbnail"
      v-lazy="thumbnail"
      class="workview-image__image"
      src="/static/imgs/thumbnail_placeholder.png"
    >
    <slot />
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  computed
} from 'vue'

import { TooltipOptions } from '@/types'

import { WorkviewImageProps as Type } from './types'

/**
 * @Component WorkviewImage
 * ~ Will show a wokview thumbnail, with a video overlay in case it's a video
 * @param {string} filename The image filename
 * @param {string} thumbnail The image thunmbnail url
 * @param {boolean} selected if the workview image is the selected one
 * @param {boolean} isVide if the workview image is actualyl a video
 */
export default defineComponent({
  name: 'WorkviewImage',
  props: {
    filename: {
      type: String,
      required: true
    },
    thumbnail: {
      type: String,
      required: true
    },
    selected: {
      type: Boolean,
      default: false
    },
    isVideo: {
      type: Boolean,
      default: false
    }
  },
  setup (props: Type) {
    const tooltip = computed((): TooltipOptions => {
      return {
        content: props.filename,
        classes: 'tooltip--workview-filename',
        // hide: 0 is very important to reduce a glitch due
        // to recycle-scroller component recyclying
        delay: { show: 300, hide: 0 }
      }
    })

    return {
      tooltip
    }
  }
})
</script>

<style lang="scss" scoped>
.workview-image {
  height: 100%;
  width: 100%;
  position: relative;
  border-radius: $border-radius-default;
  overflow: hidden;

  &--is-video {
    &::before {
      content: '';
      display: block;
      position: absolute;
      @include fullsize;
      background-image: url('./../assets/tape.png');
      background-position: center center;
      background-size: cover;
      background-repeat: no-repeat;
      z-index: 2;
    }
  }

  &::before,
  &::after {
    content: '';
    display: block;
    position: absolute;
    @include fullsize;
    border-radius: $border-radius-default;
    z-index: 1;
  }

  &--selected {
    &::after {
      border: 3px solid $colorInteractivePrimaryDefault;
    }
  }

  &:hover {
    .workview-image__image {
      opacity: 0.85;
    }
  }

  &--selected {
    .workview-image__image {
      opacity: 1;
    }
  }

  &__image {
    position: relative;
    height: 100%;
    width: 100%;
    border-radius: $border-radius-default !important;
    object-fit: cover;
    opacity: 0.65;
  }
}
</style>
