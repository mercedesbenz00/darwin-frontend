<template>
  <background>
    <div class="auth header">
      <Logo />
    </div>
    <div class="center__content">
      <div class="login">
        <teaser
          title="Log In"
          image="login.png"
        />
        <form
          class="login__form"
          @submit.prevent="onLogin"
        >
          <div
            v-if="!invitation"
            class="login__form__title"
          >
            Welcome back!
          </div>
          <div
            v-if="invitation"
            class="login__form__title"
          >
            Log in as {{ invitation.user.first_name }} to join {{ invitation.team.name }}
          </div>
          <div class="login__form__input">
            <input-field
              v-model="email"
              type="email"
              name="email"
              label="Email"
              theme="light"
              required="required"
              autocomplete="email"
              :error="error.email"
              :readonly="!!invitation"
              auto-focus
            />
          </div>

          <div class="login__form__input">
            <input-field
              ref="password"
              v-model="password"
              type="password"
              name="password"
              label="Password"
              theme="light"
              required="required"
              autocomplete="current-password"
              :error="error.password"
            >
              <div
                slot="advisor"
                class="login__form__input--forgot__password"
                @click="onForgotPassword"
              >
                Forgot Password?
              </div>
            </input-field>
          </div>

          <div class="login__form__actions">
            <div class="login__form__remember">
              <check-box
                id="remember"
                v-model="remember"
                name="remember"
                label="Remember me"
                size="small"
              />
            </div>
            <div class="login__form__buttons">
              <primary-button
                size="medium"
                type="submit"
                :disabled="loading"
              >
                Log In
              </primary-button>

              <separator class="separator">
                OR
              </separator>

              <div class="login__form__sso">
                <google-auth-button />
                <secondary-button
                  size="medium"
                  tag="router-link"
                  :to="{ name: 'LoginSSO' }"
                  :disabled="loading"
                  class="login__form__sso-button"
                >
                  Use Single<br>Sign On (SSO)
                </secondary-button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  </background>
</template>

<script lang="ts">
import isEmail from 'validator/lib/isEmail'
import isEmpty from 'validator/lib/isEmpty'
import {
  computed,
  defineComponent,
  ref,
  Ref,
  watch,
  onMounted
} from 'vue'

import GoogleAuthButton from '@/components/Auth/GoogleAuthButton.vue'
import Background from '@/components/Common/Background.vue'
import CheckBox from '@/components/Common/CheckBox/V1/CheckBox.vue'
import InputField from '@/components/Common/InputField/V1/InputField.vue'
import Logo from '@/components/Common/Logo.vue'
import Separator from '@/components/Common/Separator.vue'
import Teaser from '@/components/Common/Teaser.vue'
import { useGA } from '@/composables/useGA'
import { useNextDefaultRoutePath } from '@/composables/useNextDefaultRoutePath'
import { useRoute, useRouter } from '@/composables/useRouter'
import { useStore } from '@/composables/useStore'
import { confirmInvitation } from '@/store/modules/auth/actions/confirmInvitation'
import { login } from '@/store/modules/auth/actions/login'
import { InvitationPayload, Login2FAResponsePayload, StoreActionResponse } from '@/store/types'
import { getToken, ParsedError } from '@/utils'

type LogInError = {
  email?: string
  password?: string
}

export default defineComponent({
  name: 'Login',
  components: {
    Background,
    CheckBox,
    GoogleAuthButton,
    InputField,
    Logo,
    Separator,
    Teaser
  },
  setup () {
    const { commit, state, dispatch } = useStore()
    const { getDefaultNextRoutePath } = useNextDefaultRoutePath()
    const route = useRoute()
    const router = useRouter()
    const ga = useGA()

    const invitation: Ref<InvitationPayload | null> = ref(null)
    const email = ref('')
    const password = ref('')
    const remember = ref(false)
    const loading = ref(false)
    const error: Ref<LogInError> = ref({})

    const handleLoginError = (response: ParsedError): void => {
      const { error: errorResponse } = response
      error.value = {}
      const { status, message } = errorResponse

      if (status === 410) {
        ga.event('login', 'submit', 'failure_account_deleted', status)
        router.push('/account-deleted')
        return
      }

      if (status === 400) {
        error.value = { email: message as string }
        ga.event('login', 'submit', 'failure_invalid_request', status)
      } else if (status === 401) {
        password.value = ''
        dispatch('toast/warning', { content: message })
        ga.event('login', 'submit', 'failure_not_authorized', status)
      } else {
        dispatch('toast/warning', { content: message })
        ga.event('login', 'submit', 'failure_request_failed', status)
      }
    }

    const validateForm = (): boolean => {
      error.value = {}

      if (isEmpty(email.value)) {
        error.value.email = 'Email cannot be empty'
      }

      if (!isEmail(email.value)) {
        error.value.email = 'Should be a valid email'
      }

      if (isEmpty(password.value)) {
        error.value.password = 'Password cannot be empty'
      }

      return Object.keys(error.value).length === 0
    }

    /**
     * Called on succesfull log in, either with stored token, or form submission.
     *
     * Redirects to previously attempted route if possible, otherwise to /datasets
     */
    const onLoggedIn = (): void => {
      error.value = {}
      ga.event('login', 'submit', 'success')
      router.push(route.params.prev || getDefaultNextRoutePath(router.currentRoute.name))
    }

    const setup2fa = async (): Promise<void> => {
      const { error, data } = await dispatch('auth/setup2fa')
      if (error) {
        dispatch('toast/warning', { content: error.message })
        return
      }
      router.push(`/setup-2fa?secret_key=${data.secret_2fa}`)
    }

    const handleRequired2FA = (response: Login2FAResponsePayload): void => {
      const { required_2fa: required2fa, set_up_2fa: isSetup2fa } = response
      if (!required2fa) {
        return onLoggedIn()
      }

      commit('auth/SET_2FA_CREDENTIALS', {
        email: email.value,
        password: password.value
      })
      if (isSetup2fa) {
        router.push('/login-2fa?origin=login')
      } else {
        setup2fa()
      }
    }

    const onLogin = async (): Promise<void> => {
      if (!validateForm()) {
        ga.event('login', 'redirect', 'success')
        return
      }
      const params = { email: email.value, password: password.value, rememberMe: remember.value }

      const { token } = route.query
      const { invitation } = state.auth

      loading.value = true

      const response: StoreActionResponse<typeof confirmInvitation | typeof login> =
        (!!token && !!invitation)
          ? await dispatch('auth/confirmInvitation', { ...params, token })
          : await dispatch('auth/login', params)

      loading.value = false

      if ('error' in response) {
        handleLoginError(response)
        return
      }

      if (!('data' in response)) {
        return
      }
      if ('required_2fa' in response.data) {
        handleRequired2FA(response.data)
        return
      }

      onLoggedIn()
    }

    onMounted(async () => {
      loading.value = true

      if (getToken()) {
        const user = await dispatch('auth/loginWithToken')
        ga.event('login', 'submit', 'failure_form_invalid')

        loading.value = false
        if (user) { return onLoggedIn() }
      }

      loading.value = false
      // check if fulfilling invitation
      const token = route.query.token
      const authInvitation = state.auth.invitation

      if (token && authInvitation) {
        /**
         * In case of invitations, fill in the email with the one from the invitation
         */
        email.value = authInvitation.email
        invitation.value = authInvitation
      }
    })

    const errorMessage = computed(() => route.query.error_message as string)
    /**
     * Show error if route query contains a "error_message" key
     */
    watch(errorMessage, (message) => {
      if (!message) { return }
      dispatch('toast/warning', { content: decodeURIComponent(message) })
      ga.event('login', 'submit', 'failure_not_authorized')
    }, { immediate: true })

    const onForgotPassword = (): void => {
      router.push('/forgot-password')
    }

    const onRegister = (): void => {
      router.push('/register')
    }

    return {
      invitation,
      email,
      error,
      password,
      loading,
      remember,
      onLogin,
      onForgotPassword,
      onRegister
    }
  }
})
</script>

<style lang="scss" scoped>
.login {
  @include row;
  align-items: flex-end;
  margin-bottom: 95px;
}

.login__form {
  width: 520px;
  height: 460px;
  background-color: white;
  border-radius: 0px $border-radius-default $border-radius-default 0px;
  box-shadow: 0 20px 30px 10px rgba(145, 169, 192, 0.3);
  padding-left: 70px;
  padding-right: 50px;
}

.login__form__title {
  @include typography(lg, default, bold);
  text-align: left;
  letter-spacing: 0.01em;
  color: $colorSecondaryDark;
  margin: 50px 0 25px 0;
}

.login__form__input {
  @include row--center;
  padding: 12px 0 13px 0;
}

.login__form__actions {
  @include col--center;
  margin-top: $defaultSpace;
}

.login__form__remember {
  width: 100%;
  @include row;
  justify-content: flex-start;
}

.login__form__buttons {
  @include col--center;
  margin-top: $defaultSpace;
  justify-content: flex-end;
  align-items: center;
  width: 100%;

  button, a {
    width: 100%;
  }

  .login__form__sso {
    display: flex;
    justify-content: space-between;
    width: 100%;
  }

  .login__form__sso-button {
    border: none;
    color: $colorPrimaryDark;
    height: auto;
    margin-right: 12px;
    padding: 0;
    justify-content: flex-end;

    font-weight: bold;

    &:hover {
      background: transparent;
      color: $colorPrimaryLight;
    }
  }

  .separator {
    margin-top: $defaultSpace * 1.25;
    margin-bottom: calc($defaultSpace / 2);
  }
}

.login__form__input--forgot__password {
  @include typography(sm, default, 600);
  text-align: right;
  color: $colorSecondaryLight;
  cursor: pointer;

  &:hover {
    opacity: 0.7;
  }

  &:active, &:focus {
    opacity: 0.5;
  }
}

.login__form__register {
  @include row;
  justify-content: flex-end;
  align-items: center;
  padding: 0 50px 0 70px;
}
</style>
