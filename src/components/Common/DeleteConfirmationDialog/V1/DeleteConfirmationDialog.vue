<template>
  <modal
    :name="name"
    transition="pop-out"
    width="30%"
    height="auto"
    :min-width="200"
    :max-width="500"
    :classes="['confirm-delete']"
    :click-to-close="false"
    @before-open="onBeforeOpen"
    @closed="onClosed"
  >
    <div
      v-loading="showLoading && loading"
      :loading-options="{ label: null }"
      class="modal__container"
    >
      <confirmation-dialog-layout>
        <template #title>
          {{ title }}
        </template>
        <template #description>
          {{ detail }}
        </template>
        <template #footer>
          <secondary-button
            class="modal__footer-left"
            @click.stop.prevent="cancel"
          >
            Cancel
          </secondary-button>
          <negative-button
            class="modal__footer-right"
            :disabled="loading"
            @click.stop.prevent="confirm"
          >
            {{ buttonText }}
          </negative-button>
        </template>
      </confirmation-dialog-layout>
    </div>
  </modal>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'

import ConfirmationDialogLayout from '@/components/Common/ConfirmationDialogLayout.vue'

/**
 * Wrapper around a vue-js-modal
 *
 * The name property is used to open and close the modal,
 * so multiple modals rendered within the same template need to have unique names.
 */
@Component({ name: 'delete-confirmation-dialog', components: { ConfirmationDialogLayout } })
export default class DeleteConfirmationDialog extends Vue {
  @Prop({ required: true })
  title!: string

  @Prop({ required: true })
  detail!: string

  @Prop({ required: false, default: 'DELETE' })
  buttonText!: string

  @Prop({ required: false, default: 'confirm-delete' })
  name!: string

  @Prop({ required: false, default: false, type: Boolean })
  loading!: boolean

  @Prop({ required: false, default: false, type: Boolean })
  showLoading!: boolean

  onBeforeOpen () {
    this.$store.dispatch('ui/putBackSidebar')
  }

  onClosed () {
    this.$store.dispatch('ui/bringFrontSidebar')
  }

  show () {
    this.$modal.show(this.name)
  }

  cancel () {
    this.$emit('canceled')
    this.close()
  }

  close () {
    this.$modal.hide(this.name)
  }

  confirm () {
    this.$emit('confirmed')
  }
}
</script>

<!-- eslint-disable vue-scoped-css/enforce-style-type -->
<style lang="scss">
.confirm-delete {
  @include confirmation-dialog-modal;
}

.confirm-delete.v--modal-box {
  @include col--center;

  .modal__container {
    width: 100%;
    @include col--center;
    border-radius: 5px;
    background: $colorLineGrey;
  }
}
</style>
