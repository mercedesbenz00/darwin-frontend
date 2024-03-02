<template>
  <modal
    name="cancel-plan-confirm-modal"
    width="30%"
    height="auto"
    :min-width="200"
    :max-width="500"
    transition="pop-out"
    :classes="['cancel-plan-confirm']"
    :click-to-close="false"
    @before-open="onBeforeOpen"
    @closed="onClosed"
  >
    <confirmation-dialog-layout>
      <template #title>
        Cancel your plan?
      </template>
      <template #description>
        <div class="cancel-plan__content">
          <div class="cancel-plan__description">
            When your billing period elapses, all datasets, user statistics,
            annotations, models, and settings will be permanently deleted.<br>
            Type "<strong>cancel my plan</strong>" to confirm.
          </div>
          <input-field
            v-model="confirmText"
            auto-focus
          />
        </div>
      </template>
      <template #footer>
        <secondary-button
          class="modal__footer-left"
          type="button"
          @click.stop.prevent="cancel"
        >
          Back
        </secondary-button>
        <negative-button
          class="modal__footer-right"
          :disabled="!submitEnabled"
          type="button"
          @click.stop.prevent="confirm"
        >
          CONFIRM
        </negative-button>
      </template>
    </confirmation-dialog-layout>
  </modal>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

import ConfirmationDialogLayout from '@/components/Common/ConfirmationDialogLayout.vue'
import InputField from '@/components/Common/InputField/V1/InputField.vue'
import {
  ProductType
} from '@/store/modules/billing/types'
/**
 * Wrapper around a vue-js-modal
 *
 * The name property is used to open and close the modal,
 * so multiple modals rendered within the same template need to have unique names.
 */
@Component({
  name: 'cancel-plan-confirm-modal',
  components: { ConfirmationDialogLayout, InputField }
})
export default class CancelPlanConfirmModal extends Vue {
  confirmText: string = ''

  get submitEnabled () {
    return this.confirmText === 'cancel my plan'
  }

  onBeforeOpen () {
    this.$store.dispatch('ui/putBackSidebar')
  }

  onClosed () {
    this.$store.dispatch('ui/bringFrontSidebar')
  }

  cancel () {
    this.$emit('canceled')
    this.close()
  }

  confirm () {
    this.$emit('submit')
    this.cancelPlan()
    this.close()
  }

  close () {
    this.$modal.hide('cancel-plan-confirm-modal')
  }

  async cancelPlan () {
    const { error } = await this.$store.dispatch('billing/setSubscriptionAmount', {
      type: ProductType.AnnotationCredits,
      value: 0
    })

    if (error) {
      this.$emit('billing-error', error.code)
      return this.$store.dispatch('toast/warning', { content: error.message })
    }
    this.$modal.hide(ProductType.AnnotationCredits)
  }
}
</script>

<!-- eslint-disable vue-scoped-css/enforce-style-type -->
<style lang="scss">
.cancel-plan-confirm {
  @include col--center;
  @include confirmation-dialog-modal;
}

.cancel-plan__description {
  margin-bottom: 20px;

  strong { font-weight: bold; }
}
</style>
