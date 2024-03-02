<template>
  <background>
    <div class="auth header">
      <logo />
    </div>
    <div class="center__content">
      <div class="login-tfa">
        <login-tfa-form
          :show-error="showError"
          :token.sync="token"
          @confirm="onConfirm"
        >
          <template #actions="{ confirmDisabled }">
            <secondary-button
              class="login-tfa__back"
              @click="goBack"
            >
              Back
            </secondary-button>
            <primary-button
              class="login-tfa__confirm"
              :disabled="confirmDisabled || confirming"
              @click="onConfirm"
            >
              CONFIRM
            </primary-button>
          </template>
        </login-tfa-form>
      </div>
    </div>
  </background>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  ref,
  Ref,
  onMounted
} from 'vue'

import LoginTfaForm from '@/components/Auth/TwoFactorAuthentication/LoginTfaForm.vue'
import Background from '@/components/Common/Background.vue'
import Logo from '@/components/Common/Logo.vue'
import { useNextDefaultRoutePath } from '@/composables/useNextDefaultRoutePath'
import { useRoute, useRouter } from '@/composables/useRouter'
import { useStore } from '@/composables/useStore'
import { Confirm2faActionParams } from '@/store/modules/auth/actions/confirm2fa'
import { Login2FAActionParams } from '@/store/modules/auth/actions/login2fa'
import { TfaCredentials } from '@/store/modules/auth/types'

export default defineComponent({
  name: 'LoginTfa',
  components: {
    Background,
    Logo,
    LoginTfaForm
  },
  setup () {
    const { commit, state, dispatch } = useStore()
    const { getDefaultNextRoutePath } = useNextDefaultRoutePath()
    const route = useRoute()
    const router = useRouter()

    const showError = ref(false)
    const confirming = ref(false)
    const token: Ref<string | null> = ref(null)

    const credentials = computed((): TfaCredentials | null => state.auth.tfaCredentials)
    const origin = computed(() => route.query.origin as string | null)

    onMounted(() => {
      /**
       * "auth/login2fa" and "auth/confirm2fa" accepts
       * { email, password, token } and we should use this during login process only
       * If none of them is available, we need to redirect them back to logins
       */
      if (!credentials.value) {
        router.replace('/login')
      }
    })

    const goBack = (): void => {
      router.go(-1)
    }

    const onConfirm = async (): Promise<void> => {
      if (!credentials.value || !token.value) { return }

      confirming.value = true
      const params: Login2FAActionParams | Confirm2faActionParams = {
        token: token.value,
        email: credentials.value.email,
        password: credentials.value.password
      }

      let response
      if (origin.value === 'setup2fa') {
        response = await dispatch('auth/confirm2fa', params)
      } else {
        response = await dispatch('auth/login2fa', params)
      }
      confirming.value = false

      if ('error' in response) {
        showError.value = true
        return
      }
      router.push(getDefaultNextRoutePath(router.currentRoute.name))
      commit('auth/SET_2FA_CREDENTIALS', null)
    }

    return {
      confirming,
      showError,
      token,
      goBack,
      onConfirm
    }
  }
})
</script>

<style lang="scss" scoped>
.login-tfa {
  @include row--center;
  width: 450px;
  background: $colorWhite;
  border-radius: 5px;
}
</style>
