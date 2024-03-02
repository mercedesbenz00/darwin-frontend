<template>
  <modal
    :name="modalName"
    :width="width"
    height="auto"
    :adaptive="true"
    :focus-trap="true"
    @before-open="onBeforeOpen"
  >
    <transition name="fade">
      <setup-tfa-form
        v-if="showSetupForm"
        v-loading="!secretKey"
        class="setup-tfa-form"
        :email="email"
        :secret-key="secretKey"
      >
        <template #actions>
          <secondary-button
            type="button"
            @click="onClose"
          >
            Close
          </secondary-button>
          <primary-button
            type="button"
            @click="onContinue"
          >
            CONTINUE
          </primary-button>
        </template>
      </setup-tfa-form>
    </transition>

    <transition name="fade">
      <login-tfa-form
        v-if="!showSetupForm"
        class="confirm-tfa-form"
        :show-error="showConfirmError"
        :token.sync="token"
        @confirm="onConfirm"
      >
        <template #actions>
          <secondary-button
            v-if="setupRequired"
            type="button"
            @click="onSetup"
          >
            Back
          </secondary-button>
          <secondary-button
            v-else
            type="button"
            @click="onClose"
          >
            Close
          </secondary-button>
          <primary-button
            type="button"
            @click="onConfirm"
          >
            CONFIRM
          </primary-button>
        </template>
      </login-tfa-form>
    </transition>
  </modal>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
import { State } from 'vuex-class'

import LoginTfaForm from '@/components/Auth/TwoFactorAuthentication/LoginTfaForm.vue'
import SetupTfaForm from '@/components/Auth/TwoFactorAuthentication/SetupTfaForm.vue'
import { RootState, UserPayload } from '@/store/types'

@Component({
  name: 'setup-tfa-modal',
  components: { LoginTfaForm, SetupTfaForm }
})
export default class SetupTfaModal extends Vue {
  @Prop({ required: false, type: Boolean, default: true })
  setupRequired!: boolean

  @State((state: RootState) => state.user.profile)
  profile!: UserPayload

  readonly modalName = 'setup-tfa-modal'
  secretKey: string | null = null
  showSetupForm: boolean = true
  showConfirmError: boolean = false
  token: string | null = null

  get width () {
    return 450 * this.$theme.getCurrentScale()
  }

  get email () {
    return this.profile.email
  }

  @Watch('setupRequired', { immediate: true })
  onHideSetup () {
    this.showSetupForm = this.setupRequired
  }

  onBeforeOpen () {
    this.secretKey = null
    if (this.setupRequired) {
      this.setup2fa()
    }
  }

  onClose () {
    this.$modal.hide(this.modalName)
  }

  async onConfirm () {
    if (!this.token) { return }
    await this.confirm2fa(this.token)
  }

  onContinue () {
    this.showSetupForm = false
    this.showConfirmError = false
  }

  onSetup () {
    this.showSetupForm = true
    this.showConfirmError = false
  }

  async setup2fa () {
    const { error, data } = await this.$store.dispatch('auth/setup2fa')
    if (error) {
      this.$store.dispatch('toast/warning', { content: error.message })
      return
    }

    this.secretKey = data.secret_2fa
  }

  async confirm2fa (token: string) {
    const { error } = await this.$store.dispatch('auth/confirm2fa', { token })
    if (error) {
      this.$store.dispatch('toast/warning', { content: error.message })
      this.showConfirmError = true
      return
    }

    this.$emit('confirmed')
    this.$modal.hide(this.modalName)
  }
}
</script>
