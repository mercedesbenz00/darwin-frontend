<template>
  <toast-template :variant="variant">
    <div class="minimal-toast__container">
      <div class="minimal-toast-icon__wrapper">
        <component
          :is="getComponent(variant)"
          :variant="getComponentVariant(variant)"
        />
      </div>
      <h3
        class="minimal-toast-status__label"
        :class="`minimal-toast-status__label--${variant}`"
      >
        {{ meta.title }}
      </h3>
    </div>
  </toast-template>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import { Prop } from 'vue-property-decorator'

import { IconColoredComplete as SuccessToastIcon } from '@/assets/icons/V2/Colored'
import {
  IconDuotoneInfo as DefaultToastIcon,
  IconDuotoneWarn as WarningToastIcon,
  IconDuotoneWarn as ErrorToastIcon
} from '@/assets/icons/V2/Duotone'

import ToastTemplate from './ToastTemplate.vue'
import { ToastEvent, ToastProps } from './types'

@Component({
  name: 'minimal-toast',
  components: {
    ToastTemplate,
    WarningToastIcon,
    ErrorToastIcon,
    SuccessToastIcon,
    DefaultToastIcon
  }
})
export default class MinimalToast extends Vue {
  @Prop({ required: true, type: String })
  variant!: ToastProps['variant']

  @Prop({ required: true, type: Object as () => ToastProps['meta'] })
  meta!: ToastProps['meta']

  getComponent (i: ToastEvent): string {
    const suffix = i.toLowerCase()

    return `${suffix}-toast-icon`
  }

  getComponentVariant (i: ToastEvent): string {
    if (i === ToastEvent.ERROR) { return 'red' }
    if (i === ToastEvent.WARNING) { return 'orange' }

    return 'inverted'
  }
}
</script>

<style lang="scss" scoped>
.minimal-toast__container {
  display: flex;
  align-items: center;
  justify-content: flex-start;

  & > * {
    &:first-child {
      margin-right: 4px;
    }
  }
}

.minimal-toast-status__label {
  @include typography(md-1, inter, 500);

  &--default {
    color: $colorStatusInformative;
  }

  &--success {
    color: $colorStatusPositive;
  }

  &--error {
    color: $colorStatusNegative;
  }

  &--warning {
    color: $colorStatusWarning;
  }
}

.minimal-toast-icon__wrapper {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  width: 20px;
  height: 20px;
}
</style>
