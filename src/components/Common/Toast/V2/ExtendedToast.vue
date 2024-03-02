<template>
  <toast-template
    :variant="variant"
    extended
  >
    <div
      class="extended-toast__container"
      :style="{'align-items': meta.desc ? 'flex-start' : 'center'}"
    >
      <div class="extended-toast-icon__wrapper">
        <component
          :is="getComponent(variant)"
          :variant="getComponentVariant(variant)"
        />
      </div>
      <div class="extended-toast-content__wrapper">
        <h3
          class="extended-toast__label primary"
          :class="`extended-toast__label--${variant}`"
        >
          {{ meta.title }}
        </h3>
        <h3
          class="extended-toast__label"
          :class="`extended-toast__label--${variant}`"
          style="margin-top: 4px"
          v-if="meta.desc"
        >
          {{ meta.desc }}
        </h3>
      </div>
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
  IconDuotoneWarn as ErrorToastIcon,
  IconDuotoneWarn as WarningToastIcon
} from '@/assets/icons/V2/Duotone'
import { IconMonoClose } from '@/assets/icons/V2/Mono'
import ToastTemplate from '@/components/Common/Toast/V2/ToastTemplate.vue'
import { ToastEvent, ToastProps } from '@/components/Common/Toast/V2/types'

@Component({
  name: 'extended-toast',
  components: {
    ToastTemplate,
    IconMonoClose,
    WarningToastIcon,
    ErrorToastIcon,
    SuccessToastIcon,
    DefaultToastIcon
  }
})
export default class ExtendedToast extends Vue {
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
.extended-toast__container {
  display: grid;
  grid-gap: 12px;
  grid-template-columns: 20px max(791px) 20px;
}

.extended-toast-icon__wrapper {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  width: 20px;
  height: 20px;
}

.extended-toast-content__wrapper {
  @include col--left;
  justify-content: flex-start;
}

.extended-toast__label {
  @include typography(md-1, inter, 500);
  color: $colorContentDefault;
  font-weight: 500;
  user-select: none;

  &--default {
    color: $colorStatusInformative;
  }

  &--warning {
    color: $colorStatusWarning;
  }

  &--error {
    color: $colorStatusNegative;
  }

  &--success {
    color: $colorStatusPositive;
  }
}

.primary {
  font-weight: 600;
}

</style>
