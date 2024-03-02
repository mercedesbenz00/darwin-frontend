<template>
  <div
    v-tooltip="tooltip"
    class="status"
  >
    <span
      class="status__content"
    >
      <div
        class="status__content__icon"
        :class="{
          [`status__content__icon--${value}`]: true,
          [`status__content__icon--${value}--outline`]: outline
        }"
      />
    </span>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import { TooltipOptions } from '@/types'

import { StatusProps, StatusOptions } from '.'

@Component({
  name: 'status'
})
export default class Status extends Vue {
  @Prop({ type: String, default: StatusOptions.INACTIVE })
  value!: StatusProps['value']

  @Prop({ type: Boolean, default: false })
  outline!: StatusProps['outline']

  get tooltip (): TooltipOptions {
    return {
      placement: 'bottom',
      content: this.value,
      classes: 'tooltip--status',
      delay: { show: 300, hide: 300 }
    }
  }
}
</script>

<!-- eslint-disable vue-scoped-css/enforce-style-type -->
<style lang="scss">
.tooltip--status {
  .tooltip-inner {
    text-transform: capitalize
  }
}
</style>

<style lang="scss" scoped>
.status {
  @include row--center;

  &__content {
    @include row--center;
    border-radius: 6px;

    &__icon {
      @include col--center;
      height: 8px;
      width: 8px;
      border-radius: 100%;

      &--active,
      &--running {
        background-color: $colorStatusPositive;

        &--outline {
          outline: 2px solid $colorStatusPositiveSurface;
        }
      }

      &--draft {
        background-color: $colorStatusWarning;

        &--outline {
          outline: 2px solid $colorStatusWarningSurface;
        }
      }

      &--offline {
        background-color: $colorStatusNegative;

        &--outline {
          outline: 2px solid $colorStatusNegativeSurface;
        }
      }

      &--inactive {
        background-color: $colorContentSecondary;

        &--outline {
          outline: 2px solid $colorContentSecondarySurface;
        }
      }
    }
  }
}
</style>
