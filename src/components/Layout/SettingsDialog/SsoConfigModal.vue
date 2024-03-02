<template>
  <modal
    name="ssoConfig"
    width="35%"
    height="600"
    class="sso__modal"
    @before-open="onBeforeOpen"
  >
    <div class="modal__header">
      <h3>Configure SSO</h3>
    </div>
    <div
      v-loading="loading"
      class="modal__content modal__content_sso"
    >
      <form
        class="sso-form"
        @submit.prevent="onSubmit"
      >
        <p class="sso-form__info">
          Please, enter a valid
          <span v-tooltip="samlTooltip">SAML</span>
          SSO configuration. Refer to our <a
            href="https://docs.v7labs.com/docs/single-sign-on-sso-configuration"
            target="_blank"
          >documentation</a> on what to insert below.
        </p>

        <text-area
          id="ssoConfig"
          v-model="ssoConfig"
          theme="transparent"
          class="sso-form__textarea"
          required
          type="text"
          name="ssoConfig"
        />

        <div class="sso-form__actions">
          <secondary-button
            type="button"
            :disabled="loading"
            @click="onClose"
          >
            Cancel
          </secondary-button>

          <primary-button
            type="submit"
            :disabled="loading"
          >
            Confirm
          </primary-button>
        </div>
      </form>
    </div>
  </modal>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { State } from 'vuex-class'

import TextArea from '@/components/Common/TextArea.vue'
import { TeamPayload } from '@/store/modules/admin/types'
import { loadConfig } from '@/store/modules/sso/actions/loadConfig'
import { saveConfig } from '@/store/modules/sso/actions/saveConfig'
import { RootState, StoreActionPayload, StoreActionResponse } from '@/store/types'

@Component({
  name: 'sso-config-modal',
  components: {
    TextArea
  }
})
export default class SsoConfigModal extends Vue {
  @State((state: RootState) => state.team.currentTeam)
  currentTeam!: TeamPayload | null

  ssoConfig: string = ''
  loading: boolean = false

  async onBeforeOpen (): Promise<void> {
    // API will return 404 when the config is not exists
    this.loading = true
    const response: StoreActionResponse<typeof loadConfig> =
      await this.$store.dispatch('sso/loadConfig')
    this.loading = false

    if ('error' in response) {
      this.$store.dispatch('toast/warning', { content: response.error.message })
      return
    }

    if (response.data?.idp_metadata) {
      this.ssoConfig = response.data?.idp_metadata
    }
  }

  onClose (): void {
    this.$modal.hide('ssoConfig')
  }

  async onSubmit (): Promise<void> {
    this.loading = true
    const payload: StoreActionPayload<typeof saveConfig> = this.ssoConfig
    const { error } = await this.$store.dispatch('sso/saveConfig', payload)
    this.loading = false

    if (error) {
      this.$store.dispatch('toast/warning', { content: error.message })
      return
    }

    const content = `You've successfully save SSO config for team ${this.currentTeam?.name}`
    this.$store.dispatch('toast/notify', { content })

    this.onClose()
  }

  samlTooltip = {
    content: [
      'Security Assertion Markup Language (SAML)',
      'is an open standard that allows identity providers (IdP)',
      'to pass authorization credentials to service providers (SP)'
    ].join(' ')
  }
}
</script>

<style lang="scss" scoped>
.sso__modal {
  .modal__header {
    @include typography(xl-1, default, 700);
    background: $colorGriteDark;
  }
}

.modal__content_sso {
  height: 100%;
  max-height: none;
  padding: 0;
  padding-bottom: $defaultSpace;
}

.sso-form {
  display: grid;
  grid-template-rows: auto 1fr auto;
  height: 100%;

  .sso-form__info {
    padding: 0 calc($defaultSpace / 2);
    text-align: center;
    margin-bottom: $defaultSpace;

    a {
      color: $colorPrimaryLight;
      font-weight: bold;
    }
  }

  .sso-form__textarea {
    padding: 0 calc($defaultSpace / 2);

    & > textarea {
      border-radius: 5pt;
      overflow: hidden;
      background: $colorSecondaryLight3;
    }
  }

  .sso-form__actions {
    @include row--center;
    justify-content: space-around;
    margin-top: $defaultSpace;
    padding: 0 $defaultSpace;

    button {
      width: 35%;
    }
  }
}
</style>

<!-- eslint-disable vue-scoped-css/enforce-style-type -->
<style lang="scss">

.sso-form {
  .sso-form__textarea {
    padding: 0 calc($defaultSpace / 2);

    & > textarea.text-area__input {
      border-radius: 5pt;
      background: $colorSecondaryLight3;
    }
  }
}

.sso__modal {
  .v--modal {
    display: flex;
    flex-direction: column;
    border-radius: 10pt;
    overflow: hidden;
  }
}
</style>
