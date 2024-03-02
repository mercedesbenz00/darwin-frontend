<template>
  <background>
    <div class="auth header">
      <Logo />
    </div>
    <div class="center__content">
      <div class="login">
        <teaser
          title="SSO"
          image="login.png"
        />
        <form
          class="login__form"
          @submit.prevent="onLogin"
        >
          <div class="login__form__title">
            Welcome back!
          </div>
          <div class="login__form__input">
            <input-field
              v-model="teamName"
              type="text"
              name="teamName"
              label="Team"
              theme="light"
              required="required"
              autocomplete="teamName"
              :error="error.teamName"
              auto-focus
            />
          </div>

          <div class="login__form__buttons">
            <secondary-button
              size="medium"
              tag="router-link"
              :to="{ name: 'Login' }"
              :disabled="loading"
            >
              Cancel
            </secondary-button>
            <primary-button
              size="medium"
              type="submit"
              :disabled="loading"
            >
              Log In
            </primary-button>
          </div>
        </form>
      </div>
    </div>
  </background>
</template>

<script lang="ts">
import isEmpty from 'validator/lib/isEmpty'
import {
  defineComponent,
  ref,
  Ref,
  onMounted
} from 'vue'
import { Route } from 'vue-router'

import Background from '@/components/Common/Background.vue'
import InputField from '@/components/Common/InputField/V1/InputField.vue'
import Logo from '@/components/Common/Logo.vue'
import Teaser from '@/components/Common/Teaser.vue'
import { useGA } from '@/composables/useGA'
import { useNextDefaultRoutePath } from '@/composables/useNextDefaultRoutePath'
import { useRoute, useRouter } from '@/composables/useRouter'
import { useStore } from '@/composables/useStore'
import store from '@/store'
import { getToken } from '@/utils'

type LogInError = {
  teamName?: string
}

export default defineComponent({
  name: 'LoginSSO',
  components: {
    Background,
    InputField,
    Logo,
    Teaser
  },

  beforeRouteEnter (to: Route, from: Route, next: Function) {
    if (to.query?.error_message) {
      store.dispatch('toast/warning', { content: to.query?.error_message })
    }

    next()
  },

  setup () {
    const { dispatch } = useStore()
    const { getDefaultNextRoutePath } = useNextDefaultRoutePath()
    const route = useRoute()
    const router = useRouter()
    const ga = useGA()

    const teamName = ref('')
    const loading = ref(false)
    const error: Ref<LogInError> = ref({})

    const onLoggedIn = (): void => {
      error.value = {}
      ga.event('login', 'submit', 'success')

      router.push(route.params.prev || getDefaultNextRoutePath(router.currentRoute.name))
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
    })

    const validateForm = (): boolean => {
      error.value = {}

      if (isEmpty(teamName.value)) {
        error.value.teamName = 'Team cannot be empty'
      }

      return Object.keys(error.value).length === 0
    }

    const onLogin = async (): Promise<void> => {
      if (!validateForm()) {
        ga.event('login', 'redirect', 'success')
        return
      }
      const params = { teamName: teamName.value }

      loading.value = true

      ga.event('login', 'submit', 'success')

      // It will redirect you to the SSO page
      await dispatch('auth/loginWithSSO', params)
    }

    return {
      teamName,
      loading,
      error,
      onLogin
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
  height: 430px;
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

.login__form__buttons {
  @include row;
  padding: 40px 0 36px 0;
  justify-content: flex-end;
  align-items: center;
  width: 100%;

  button:nth-child(2) {
    margin-left: $defaultSpace;
  }
}
</style>
