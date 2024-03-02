<template>
  <modal
    ref="safeConfirmation"
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
          <slot name="description" />

          <input-field
            v-model="controlText"
            class="verification-input"
            :placeholder="targetText"
            type="text"
          />
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
            :disabled="isConfirmationDisabled"
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
import InputField from '@/components/Common/InputField/V1/InputField.vue'

/**
 * Wrapper around a vue-js-modal
 *
 * The name property is used to open and close the modal,
 * so multiple modals rendered within the same template need to have unique names.
 */
@Component({
  name: 'delete-confirmation-dialog',
  components: {
    ConfirmationDialogLayout,
    InputField
  }
})
export default class DeleteConfirmationDialog extends Vue {
  @Prop({ required: true })
  title!: string

  @Prop({ required: false, default: 'DELETE' })
  buttonText!: string

  @Prop({ required: false, default: 'confirm-delete' })
  name!: string

  @Prop({ required: false, default: false, type: Boolean })
  loading!: boolean

  @Prop({ required: false, default: false, type: Boolean })
  showLoading!: boolean

  @Prop({ required: false, default: 'DELETE', type: String })
  targetText!: string

  controlText: string = ''

  $refs!: {
    safeConfirmation: Vue & { visible: boolean }
  }

  onBeforeOpen () {
    this.$store.dispatch('ui/putBackSidebar')
  }

  onClosed () {
    this.$store.dispatch('ui/bringFrontSidebar')
    this.controlText = ''
  }

  show () {
    this.$refs.safeConfirmation.visible = true
  }

  cancel () {
    this.$emit('canceled')
    this.close()
  }

  close () {
    this.$refs.safeConfirmation.visible = false
  }

  confirm () {
    this.$emit('confirmed')
  }

  get isConfirmationDisabled (): boolean {
    return this.controlText !== this.targetText
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

  .verification-input {
    margin-top: $defaultSpace;

    input {
      text-align: center;
    }
  }

  .modal__container {
    width: 100%;
    @include col--center;
    border-radius: 5px;
    background: $colorLineGrey;
  }
}
</style>
