<template>
  <modal
    v-bind="$attrs"
    v-on="$listeners"
    translate="pop-out"
    :width="scaledWidth"
    class="modal"
    :class="`modal--${size}`"
    :click-to-close="clickToClose"
  >
    <div class="modal-container-v2">
      <slot />
    </div>
  </modal>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'

import { DialogSize } from '@/components/Common/Modal/V2/types'
import { sizeValidator } from '@/components/Common/Modal/V2/validators'

@Component({
  name: 'modal-v2'
})
export default class ModalV2 extends Vue {
  @Prop({ default: DialogSize.SMALL, validator: sizeValidator })
  size!: DialogSize

  @Prop({ default: false, type: Boolean })
  clickToClose!: boolean

  get dialogWidth (): number {
    if (this.size === DialogSize.LARGE) {
      return 900
    } else if (this.size === DialogSize.MEDIUM) {
      return 580
    }
    return 480
  }

  get scaledWidth (): string | number {
    return typeof this.$attrs.width === 'string'
      ? this.$attrs.width
      : this.dialogWidth * this.$theme.getCurrentScale()
  }
}
</script>

<!-- eslint-disable vue-scoped-css/enforce-style-type -->
<style lang="scss">
.modal {
  min-height: 540px;

  &--small {
    .modal-header-v2 {
      padding: 12px 12px;
    }
    .modal-content-v2 {
      padding: 12px 12px;
    }
    .modal-footer-v2 {
      padding: 12px 12px;
    }
    .modal-header-v2-close-container {
      top: 12px;
      right: 12px;
    }
  }

  &--medium {
    .modal-header-v2 {
      padding: 16px 16px;
    }
    .modal-content-v2 {
      padding: 16px 16px;
    }
    .modal-footer-v2 {
      padding: 16px 16px;
    }
    .modal-header-v2-close-container {
      top: 16px;
      right: 16px;
    }
  }

  &--large {
    .modal-header-v2 {
      padding: 24px 24px;
    }
    .modal-content-v2 {
      padding: 24px 24px;
    }
    .modal-footer-v2 {
      padding: 16px 24px;
    }
    .modal-header-v2-close-container {
      top: 24px;
      right: 24px;
    }
  }
}
.modal-container-v2 {
  @include col;
  justify-content: center;

  width: 100%;
  height: 100%;

  position: relative;
  overflow: hidden;

  background: $colorWhite;
  border-radius: 15px;
  box-shadow: $dropshadow;
}
</style>
