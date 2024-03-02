<template>
  <background>
    <div class="auth header">
      <logo />
    </div>
    <div class="center__content">
      <div class="forgot-password_modal">
        <teaser
          title="Forgot Password?"
          image="register.png"
        />
        <form
          class="forgot-password_modal__form"
          @submit.prevent="onSubmit"
        >
          <div
            class="forgot-password_modal__form__title"
          >
            Enter your email address below and we'll send you a password reset
            link get you back on track.
          </div>
          <div class="forgot-password_modal__form__input-container">
            <input-field
              ref="email"
              v-model="email"
              type="email"
              name="email"
              placeholder="E-Mail Address"
              theme="light"
              :hint="hint"
              required="required"
              autocomplete="email"
            />
          </div>
          <div class="forgot-password_modal__form__buttons">
            <negative-button @click="onLogin">
              BACK TO LOGIN
            </negative-button>
            <positive-button
              class="submit--button"
              type="submit"
              :disabled="submitted"
            >
              {{ submitted ? 'Reset link sent' : 'Request reset link' }}
            </positive-button>
          </div>
        </form>
      </div>
    </div>
  </background>
</template>

<script lang="ts">
import isEmail from 'validator/lib/isEmail'
import isEmpty from 'validator/lib/isEmpty'
import { Component, Vue } from 'vue-property-decorator'

import Background from '@/components/Common/Background.vue'
import InputField from '@/components/Common/InputField/V1/InputField.vue'
import Logo from '@/components/Common/Logo.vue'
import Teaser from '@/components/Common/Teaser.vue'

type ForgotPasswordError = {
  email?: string
}

@Component({
  name: 'account-deleted',
  components: {
    Background,
    Logo,
    InputField,
    Teaser
  }
})
export default class ForgotPassword extends Vue {
  email: string = ''
  hint: string | null = null
  submitted: boolean = false
  error: ForgotPasswordError = {}

  $refs!: Vue['$refs'] & {
    email: InputField
  }

  async mounted () {
    const { error } = await this.$store.dispatch('auth/loginWithToken')
    if (!error) {
      this.$router.push('/datasets')
    }
  }

  async onSubmit () {
    if (!this.validateForm()) {
      this.updateErrors()
      return
    }
    this.submitted = false

    const { error } = await this.$store.dispatch('auth/forgotPassword', { email: this.email })

    if (error) {
      if (error.isValidationError) {
        this.error = error
        this.updateErrors()
      }
      return
    }

    this.submitted = true
    this.error = {}
    this.updateErrors()
  }

  onLogin () {
    this.$router.push('/login')
  }

  onRegister () {
    this.$router.push('/register')
  }

  validateForm () {
    this.error = {}

    if (isEmpty(this.email)) {
      this.error.email = 'Email cannot be empty'
    }

    if (!isEmail(this.email)) {
      this.error.email = 'Should be a valid email'
    }

    return Object.keys(this.error).length === 0
  }

  updateErrors () {
    this.$nextTick(() => {
      if (this.$refs.email) { this.$refs.email.setError(this.error.email) }
    })
  }
}
</script>

<style lang="scss" scoped>
.forgot-password_modal {
  @include row;
  align-items: flex-end;
  margin-bottom: 95px;
}

.forgot-password_modal__form {
  width: 520px;
  height: 380px;
  background-color: white;
  border-radius: 0px $border-radius-default $border-radius-default 0px;
}

.forgot-password_modal__form__title {
  @include typography(lg, default, bold);
  text-align: left;
  letter-spacing: 0.01em;
  color: $colorSecondaryDark1;
  margin: 60px 50px 25px 70px;
}

.forgot-password_modal__form__input-container {
  @include row;
  padding: 25px 50px 25px 70px;
  justify-content: flex-end;
  flex-direction: center;
}

.forgot-password_modal__form__buttons {
  padding: 75px 50px 25px 70px;
  @include row--distributed--center;
}

.submit--button {
  width: 200px;
}
</style>
