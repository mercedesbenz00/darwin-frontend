<template>
  <div>
    <negative-button
      size="small"
      @click.stop.prevent="onDelete"
    >
      Delete
    </negative-button>
    <modal
      transition="pop-out"
      width="30%"
      height="275"
      :classes="['confirm-revoke']"
      :click-to-close="false"
      :name="modalName"
    >
      <div class="modal__header">
        <p class="modal__header__title">
          Are you sure you wish to delete this key?
        </p>
        <p class="modal__header__text">
          This action cannot be undone.
        </p>
        <div
          class="modal__header__close"
          @click="cancelDelete"
        >
          &#10005;
        </div>
      </div>
      <div class="modal__footer">
        <secondary-button
          class="modal__footer-left"
          @click.stop="cancelDelete"
        >
          Cancel
        </secondary-button>
        <negative-button
          class="modal__footer-right"
          @click.stop="confirmDelete"
        >
          Delete Key
        </negative-button>
      </div>
    </modal>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'

import { ApiKeyPayload } from '@/store/modules/apiKey/types'

/**
 * Rendered next to an ability. Handles deletion.
 *
 * The original use for this component is to render it in the <key-list-item>
 * default slot, in the generalized <key-management> component, accessible from
 * the settings dialog.
 */
@Component({ name: 'delete-key-button' })
export default class DeleteKeyButton extends Vue {
  @Prop({ required: true, type: Object })
  apiKey!: ApiKeyPayload

  get modalName (): string {
    return `confirm-delete-${this.apiKey.id}`
  }

  onDelete () {
    this.$modal.show(this.modalName)
  }

  cancelDelete () {
    this.$modal.hide(this.modalName)
  }

  confirmDelete () {
    this.delete()
    this.$modal.hide(this.modalName)
  }

  deleting: boolean = false

  async delete () {
    this.deleting = true

    const { error } = await this.$store.dispatch('apiKey/deleteKey', this.apiKey)

    if (error) {
      this.$store.dispatch('toast/warning', { content: error.message })
    }

    this.deleting = false
  }
}
</script>
