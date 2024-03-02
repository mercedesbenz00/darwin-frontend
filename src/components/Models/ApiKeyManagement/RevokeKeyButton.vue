<template>
  <div>
    <negative-button
      size="small"
      @click.stop.prevent="onRevoke"
    >
      Revoke
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
          Are you sure you wish to revoke this key?
        </p>
        <p
          class="modal__header__text"
        >
          You can attach this key to the model again, or manage it from your settings page.
        </p>
        <div
          class="modal__header__close"
          @click="cancelRevoke"
        >
          &#10005;
        </div>
      </div>
      <div class="modal__footer">
        <secondary-button
          class="modal__footer-left"
          @click.stop="cancelRevoke"
        >
          Cancel
        </secondary-button>
        <positive-button
          class="modal__footer-right"
          @click.stop="confirmRevoke"
        >
          Revoke Key
        </positive-button>
      </div>
    </modal>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'

import { isRunningSession } from '@/components/Models/utils'
import { detachPermissionFromModel } from '@/store/modules/apiKey/actions/detachPermissionFromModel'
import { ApiKeyPayload } from '@/store/modules/apiKey/types'
import { RunningSessionPayload, TrainedModelPayload, StoreActionPayload } from '@/store/types'

/**
 * Renders button which completely handles detaching of an API key from a model.
 *
 * Detaching means the model-specific permission is simply removed from the key.
 *
 * The original intent of this component is for it to be rendered in the default
 * slot of the `<key-list-item>` component, as part of `<api-key-management>` in
 * `/models`
 */
@Component({ name: 'revoke-key-button' })
export default class RevokeKeyButton extends Vue {
  @Prop({ required: true, type: Object })
  apiKey!: ApiKeyPayload

  @Prop({ required: true, type: Object as () => RunningSessionPayload | TrainedModelPayload })
  model!: RunningSessionPayload | TrainedModelPayload

  get modalName (): string {
    return `confirm-revoke-${this.apiKey.id}`
  }

  onRevoke () {
    this.$modal.show(this.modalName)
  }

  cancelRevoke () {
    this.$modal.hide(this.modalName)
  }

  confirmRevoke () {
    this.revoke()
    this.$modal.hide(this.modalName)
  }

  revoking: boolean = false

  async revoke () {
    this.revoking = true

    const { apiKey, model } = this

    const payload: StoreActionPayload<typeof detachPermissionFromModel> = isRunningSession(model)
      ? { apiKey, runningSession: model }
      : { apiKey, trainedModel: model }
    const { error } = await this.$store.dispatch('apiKey/detachPermissionFromModel', payload)

    if (error) { this.$store.dispatch('toast/warning', { content: error.message }) }

    this.revoking = false
  }
}
</script>
