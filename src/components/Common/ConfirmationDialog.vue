<template>
  <modal
    :name="name"
    width="30%"
    height="auto"
    :min-width="200"
    :max-width="500"
    transition="pop-out"
    :classes="['confirmation-dialog']"
    :click-to-close="false"
    @before-open="onBeforeOpen"
    @closed="onClosed"
  >
    <div class="modal__header">
      <div
        class="modal__header__close"
        @click="cancel"
      >
        &#10005;
      </div>
    </div>
    <div class="modal__content">
      <div
        v-if="$slots.title"
        class="confirm__title"
      >
        <slot name="title" />
      </div>
      <p
        v-else
        class="confirm__title"
      >
        {{ title }}
      </p>
      <div
        v-if="$slots.detail"
        class="confirm__text"
      >
        <slot name="detail" />
      </div>
      <p
        v-else
        class="confirm__text"
        v-html="detail"
      />
    </div>
    <div class="modal__footer">
      <slot
        name="footer"
      >
        <secondary-button
          class="modal__footer-left"
          @click="cancel"
        >
          {{ cancelText }}
        </secondary-button>
        <positive-button
          class="modal__footer-right"
          :disabled="loading"
          @click="confirm"
        >
          {{ confirmText }}
        </positive-button>
      </slot>
    </div>
  </modal>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

/**
 * Wrapper around a vue-js-modal
 *
 * The name property is used to open and close the modal,
 * so multiple modals rendered within the same template need to have unique names.
 */

@Component({
  name: 'confirmation-dialog'
})
export default class ConfirmationDialog extends Vue {
  @Prop({
    required: false,
    type: String as () => string,
    default: 'Are you sure?'
  })
  title!: string

  /**
   * The raw HTML to show in the center of the dialog.
   *
   * This is an unsafe way to render HTML and should be gradually outphased in
   * favor of the #detail slot.
   */
  @Prop({
    required: false,
    type: String as () => string,
    default: 'Are you sure?'
  })
  detail!: string

  @Prop({ required: true })
  name!: string

  @Prop({ required: false, default: 'Ok' })
  confirmText!: string

  @Prop({ required: false, default: 'Cancel' })
  cancelText!: string

  @Prop({ required: false, default: false, type: Boolean })
  loading!: boolean

  /**
   * Ugly and hacky, but no better idea at the moment.
   * The default modal behavior is to put the main app sidebar into the
   * background on open, and bring it back to front on close.
   *
   * When the modal is declared in the sidebar, this causes an issue where it
   * cannot be shown, because it gets obscured by the main content area.
   *
   * In such cases, we set this prop to `true`, in order to prevent that default
   * behavior.
   */
  @Prop({ required: false, default: false, type: Boolean as () => boolean })
  sidebar!: boolean

  data: any = null

  onBeforeOpen () {
    if (this.sidebar) { return }
    this.$store.dispatch('ui/putBackSidebar')
  }

  onClosed () {
    if (this.sidebar) { return }
    this.$store.dispatch('ui/bringFrontSidebar')
  }

  show (data?: any) {
    this.data = data || null
    this.$modal.show(this.name)
  }

  cancel () {
    if (this.data) {
      this.$emit('canceled', this.data)
    } else {
      this.$emit('canceled')
    }
    this.close()
  }

  close () {
    this.data = null
    this.$modal.hide(this.name)
  }

  confirm () {
    if (this.data) {
      this.$emit('confirmed', this.data)
    } else {
      this.$emit('confirmed')
    }
  }
}
</script>

<!-- eslint-disable vue-scoped-css/enforce-style-type -->
<style lang="scss">
.confirmation-dialog {
  display: flex;
  flex-direction: column;

  &.v--modal-box {
    box-shadow: 0px 15px 30px rgba(33, 64, 92, .3);
  }
}
</style>

<style lang="scss" scoped>
.confirmation-dialog {
  .modal__header {
    background: $colorLineGrey;
  }

  .modal__content {
    padding: 0 30px;
    background: $colorLineGrey;
    max-height: none;
  }

  .modal__footer {
    background: $colorWhite;
    box-shadow: 0px 0px 10px rgba(20, 5, 60, 0.2);
    overflow: visible;
    justify-content: center;
    z-index: 2;
  }

  .modal__footer-left {
    flex: 1;
    margin-right: 10px;
  }

  .modal__footer-right {
    flex: 1;
    margin-left: 10px;
  }
}

.confirm__title {
  margin: 0 20px 20px 20px;
  @include typography(xl, headlines, 500);
  line-height: 26px;
  text-align: center;
  color: $colorSecondaryDark1;
}

.confirm__text {
  margin: 0 0 20px 0;
  @include typography(md, default);
  line-height: 20px;
  text-align: center;
  color: $colorSecondaryLight;
}
</style>
