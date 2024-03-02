<template>
  <div
    @click="$toast.dismiss($el)"
    class="toast__container"
    :class="`toast__container--${variant} ${extended && 'extended'}`"
  >
    <div class="toast__wrapper">
      <slot />
    </div>
  </div>
</template>

<script lang='ts'>
import Vue from 'vue'
import Component from 'vue-class-component'
import { Prop } from 'vue-property-decorator'

import { ToastEvent } from '@/components/Common/Toast/V2/types'

@Component({ name: 'toast-template' })
export default class ToastTemplate extends Vue {
  @Prop({ required: false, type: Boolean, default: false })
  extended!: boolean

  @Prop({ required: true, type: String })
  variant!: ToastEvent
}
</script>

<style lang='scss' scoped>
@mixin assign-variant($borderColor, $background) {
  background: $background;
  border: 1px solid $borderColor;
}

.toast__container {
  position: absolute;

  display: flex;
  align-items: center;
  justify-content: flex-start;
  width: fit-content;
  height: 42px;
  border-radius: 100px;
  opacity: 0;
  cursor: pointer;

  transition: all 225ms linear;
  pointer-events: auto;

  &--default {
    @include assign-variant($colorStatusInformative, hsla(210, 80%, 98%, 1));
  }

  &--error {
    @include assign-variant($colorStatusNegative, hsla(0, 80%, 98%, 1));
  }

  &--warning {
    @include assign-variant($colorStatusWarning, hsla(30, 96%, 98%, 1));
  }

  &--success {
    @include assign-variant($colorStatusPositive, hsla(120, 52%, 98%, 1));
  }
}

.extended {
  height: auto;
  border-radius: 12px;
}

.toast__wrapper {
  display: block;
  padding: 12px 16px 12px 12px;
}
</style>
