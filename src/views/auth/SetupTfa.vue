<template>
  <background>
    <div class="auth header">
      <logo />
    </div>
    <div class="center__content">
      <div class="setup-tfa">
        <setup-tfa-form
          v-if="credentials"
          :email="credentials.email"
          :secret-key="secretKey"
        >
          <template #actions>
            <secondary-button @click="goBack">
              Back
            </secondary-button>
            <primary-button @click="onNext">
              CONTINUE
            </primary-button>
          </template>
        </setup-tfa-form>
      </div>
    </div>
  </background>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { State } from 'vuex-class'

import SetupTfaForm from '@/components/Auth/TwoFactorAuthentication/SetupTfaForm.vue'
import Background from '@/components/Common/Background.vue'
import Logo from '@/components/Common/Logo.vue'
import { TfaCredentials } from '@/store/modules/auth/types'
import { RootState } from '@/store/types'

@Component({
  name: 'setup-tfa',
  components: {
    Background,
    Logo,
    SetupTfaForm
  }
})
export default class SetupTfa extends Vue {
  @State((state: RootState) => state.auth.tfaCredentials)
  credentials!: TfaCredentials | null

  get secretKey () {
    return this.$route.query.secret_key
  }

  mounted () {
    if (!this.credentials || !this.secretKey) {
      this.$router.replace('/login')
    }
  }

  async goBack () {
    await this.$store.dispatch('auth/logout')
    this.$router.push('/login')
  }

  onNext () {
    this.$router.push('/login-2fa?origin=setup2fa')
  }
}
</script>

<style lang="scss" scoped>
.setup-tfa {
  @include row--center;
  width: 450px;
  background: $colorWhite;
  border-radius: 5px;
}
</style>
