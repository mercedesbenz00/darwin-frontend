<template>
  <modal
    name="settings-save-confirm"
    width="30%"
    height="auto"
    :min-width="200"
    :max-width="500"
    transition="pop-out"
    :classes="['settings-save-confirm']"
    :click-to-close="false"
    @before-open="onBeforeOpen"
    @closed="onClosed"
  >
    <div
      v-loading="loading"
      :loading-options="{ label: null }"
      class="modal__container"
    >
      <confirmation-dialog-layout>
        <template #title>
          Save changes before leaving?
        </template>
        <template #footer>
          <secondary-button
            :disabled="loading"
            @click="$emit('discard')"
          >
            DISCARD
          </secondary-button>
          <positive-button
            :disabled="loading"
            @click="$emit('save')"
          >
            SAVE
          </positive-button>
        </template>
      </confirmation-dialog-layout>
    </div>
  </modal>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import ConfirmationDialogLayout from '@/components/Common/ConfirmationDialogLayout.vue'

@Component({
  name: 'settings-save-confirm-dialog',
  components: { ConfirmationDialogLayout }
})
export default class SettingsSaveConfirmDialog extends Vue {
  @Prop({ required: true, type: Boolean })
  loading!: boolean

  onBeforeOpen () {
    this.$store.dispatch('ui/putBackSidebar')
  }

  onClosed () {
    this.$store.dispatch('ui/bringFrontSidebar')
  }
}
</script>

<!-- eslint-disable vue-scoped-css/enforce-style-type -->
<style lang="scss">
.settings-save-confirm {
  @include confirmation-dialog-modal;
}

.settings-save-confirm.v--modal-box {
  @include col--center;

  .modal__container {
    @include col--center;
    border-radius: 5px;
    background: $colorLineGrey;
  }
}
</style>
