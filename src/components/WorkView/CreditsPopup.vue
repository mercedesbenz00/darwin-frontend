<template>
  <modal
    :click-to-close="false"
    :classes="['credits-popup']"
    :name="modalName"
    width="30%"
    height="auto"
    :min-width="200"
    :max-width="500"
    transition="pop-out"
  >
    <confirmation-dialog-layout>
      <template #title>
        Your Team is out of Annotation Credits
      </template>
      <template #description>
        You can add more by editing your plan and continue annotating.
      </template>
      <template #footer>
        <secondary-button @click="close">
          Close
        </secondary-button>
        <primary-button @click="managePlan">
          Manage Plan
        </primary-button>
      </template>
    </confirmation-dialog-layout>
  </modal>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'
import { State } from 'vuex-class'

import ConfirmationDialogLayout from '@/components/Common/ConfirmationDialogLayout.vue'
import { ParsedError } from '@/utils'
import { ErrorCodes } from '@/utils/error/errors'

const CREDIT_ERRORS: string[] = [
  ErrorCodes.OUT_OF_ANNOTATION_CREDITS,
  ErrorCodes.OUT_OF_SUBSCRIBED_ANNOTATION_CREDITS
]

/**
 * A modal which pops up when the user tries to annotate, the backend reports
 * lack of annotation credits, and the user is able to manage billing for the
 * team.
 *
 * The intent is to offer a link to navigate to plans tab of the settings,
 * where the user (admin or team owner) can increase the subscribed amount.
 *
 * This component doesn't check if the user is able to manage the team.
 *
 * Instead, the parent component makes this check using the ability
 * plugin (`$can`).
 */
@Component({ name: 'credits-popup', components: { ConfirmationDialogLayout } })
export default class CreditsPopup extends Vue {
  @State(state => state.workview.error)
  error!: ParsedError['error'] | null

  modalName = 'credits-popup'

  @Watch('error')
  onError () {
    const { error } = this
    if (!error) { return }
    const { code } = error
    if (!code) { return }
    if (!(typeof code === 'string')) { return }
    if (CREDIT_ERRORS.indexOf(code) === -1) { return }
    this.$modal.show(this.modalName)
  }

  managePlan () {
    this.$router.push('/datasets?settings=plans')
    this.close()
  }

  close () {
    this.$modal.hide(this.modalName)
  }
}
</script>

<!-- eslint-disable vue-scoped-css/enforce-style-type -->
<style lang="scss">
.credits-popup {
  @include confirmation-dialog-modal;
}
</style>
