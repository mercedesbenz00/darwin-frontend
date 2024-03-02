<template>
  <background>
    <div class="auth header">
      <logo />
    </div>
    <div class="center__content">
      <div class="password-reset">
        <teaser
          title="Reset your Password?"
          image="register.png"
        />
        <form
          class="password-reset__form"
          @submit.prevent="onResetPassword"
        >
          <div class="password-reset__form__title">
            Please choose a new password.
          </div>
          <div class="password-reset__form__input-container">
            <password-change
              ref="passwordChange"
              class="password-reset__change"
              :password.sync="password"
              :password-confirmation.sync="confirm"
            />
          </div>
          <div class="password-reset__form__input-container">
            <div class="password-reset__form__input-container__right">
              <positive-button type="submit">
                Change Password
              </positive-button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </background>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

import PasswordChange from '@/components/Auth/PasswordChange.vue'
import Background from '@/components/Common/Background.vue'
import Logo from '@/components/Common/Logo.vue'
import Teaser from '@/components/Common/Teaser.vue'

type PasswordResetError = {
  password?: string
  confirm?: string
}

@Component({
  name: 'password-reset',
  components: { Background, Logo, PasswordChange, Teaser }
})
export default class PasswordReset extends Vue {
  password: string = ''
  confirm: string = ''

  $refs!: Vue['$refs'] & {
    passwordChange: PasswordChange
  }

  get token () {
    return this.$route.query.token
  }

  async mounted () {
    const { error } = await this.$store.dispatch('auth/loginWithToken')
    if (!error) {
      this.$router.push('/datasets')
    }
  }

  async onResetPassword () {
    if (!this.$refs.passwordChange.validateForm()) {
      return
    }

    const { error } = await this.$store.dispatch('auth/passwordReset', {
      password: this.password,
      confirm: this.confirm,
      token: this.token
    })

    if (error) {
      this.updateErrors(error)
      return
    }

    this.$store.dispatch('toast/notify', { content: 'Your password has been updated' })
    this.$router.push('/datasets')
  }

  updateErrors (error: PasswordResetError) {
    this.$nextTick(() => {
      this.$refs.passwordChange.setErrors({
        password: error.password,
        passwordConfirmation: error.confirm
      })
    })
  }
}
</script>

<style lang="scss" scoped>
.password-reset {
  @include row;
  align-items: flex-end;
  margin-bottom: 95px;
}

.password-reset__form {
  width: 520px;
  height: 380px;
  background-color: white;
  border-radius: 0px $border-radius-default $border-radius-default 0px;
}

.password-reset__form__title {
  @include typography(lg, default, bold);
  text-align: left;
  letter-spacing: 0.01em;
  color: $colorSecondaryDark1;
  margin: 50px 50px 25px 70px;
}

.password-reset__form__input-container {
  @include row;
  padding: 25px 50px 25px 70px;
  justify-content: flex-end;
  flex-direction: center;
}
</style>
