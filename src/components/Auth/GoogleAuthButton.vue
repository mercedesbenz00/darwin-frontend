<template>
  <div v-if="googleAvailable && gClientId">
    <div
      id="g_id_onload"
      :data-client_id="gClientId"
      :data-nonce="token"
      :data-login_uri="googleSSOLoginUrl"
      data-auto_prompt="false"
    />
    <secondary-button
      class="btn-google"
      :class="{ 'hide': !isDisabled }"
      type="button"
      disabled
    >
      {{ googleButtonTitle }}
    </secondary-button>
    <div
      class="g_id_signin"
      :class="{ 'hide': isDisabled }"
      data-type="standard"
      data-size="large"
      data-theme="outline"
      :data-text="isRegister ? 'signup_with' : 'signin_with'"
      data-shape="rectangular"
      data-logo_alignment="left"
    />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import { resolveVariable } from '@/utils/config'

const GOOGLE_CLIENT_ID = resolveVariable(
  process.env.VUE_APP_GOOGLE_SSO_CLIENT_ID,
  '$GOOGLE_SSO_CLIENT_ID'
)
const BASE_API = resolveVariable(process.env.VUE_APP_BASE_API, '$BASE_API') as string

@Component({
  name: 'google-auth-button',
  components: {}
})
export default class GoogleAuthButton extends Vue {
  @Prop({ required: false, type: Boolean, default: false })
  isRegister!: boolean

  @Prop({ required: false, type: Boolean, default: false })
  isDisabled!: boolean

  @Prop({ required: false, type: String, default: '' })
  token!: string

  readonly gClientId: string | null = GOOGLE_CLIENT_ID
  readonly googleSSOLoginUrl: string
    = `${BASE_API}/users/authenticate/sso/oauth/google/validate`

  googleAvailable: boolean = true

  get googleButtonTitle (): string {
    return this.isRegister ? 'Sign up with Google' : 'Sign in with Google'
  }

  public async mounted (): Promise<void> {
    try {
      await this.loadGoogleAuthScripts()
    } catch {
      this.googleAvailable = false
      this.$store.dispatch('toast/warning', { content: 'Google sign-on is currently unavailable' })
    }
  }

  findScript = (src: string): HTMLScriptElement | undefined => {
    const scripts = Array.from(document.getElementsByTagName('script'))
    const found = scripts.find(script => script.getAttribute('src') === src)

    return found
  }

  loadGoogleAuthScripts (): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      const srcScript = 'https://accounts.google.com/gsi/client'
      const existingScript = this.findScript(srcScript)

      // If script already loaded, then remove for reloading
      if (existingScript) {
        document.body.removeChild(existingScript)
      }

      const googleAuthScript = document.createElement('script')
      googleAuthScript.setAttribute('src', srcScript)
      googleAuthScript.async = true
      googleAuthScript.defer = true

      googleAuthScript.onload = function (): void { resolve(true) }
      googleAuthScript.onerror = (err): void => { reject(err) }
      document.body.appendChild(googleAuthScript)
    })
  }
}
</script>

<!-- eslint-disable vue-scoped-css/enforce-style-type -->
<style lang="scss">
.btn-google {
  border-color: $colorGrayLiter;
  padding: 16px 12px;
}

.hide {
  display: none!important;
}
</style>
