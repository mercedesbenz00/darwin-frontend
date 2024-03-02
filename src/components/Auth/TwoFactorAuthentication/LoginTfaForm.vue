<template>
  <div class="login-tfa-form">
    <h1 class="login-tfa-form__title">
      Confirm that it’s you
    </h1>
    <div class="login-tfa-form__description">
      Head over to the <a
        class="login-tfa-form__ga-link"
        :href="appStoreLink"
        target="_blank"
      >Authenticator app</a> and enter<br>
      your 2-factor authentication code.
    </div>
    <div class="login-tfa-form__numbers">
      <login-tfa-number-cell
        v-for="(digit, index) of digits"
        :key="index"
        class="login-tfa-form__number"
        :active="currentIndex === index"
        :value="digit"
      />
    </div>
    <div class="login-tfa-form__error">
      <error-tip v-if="showError">
        That code didn’t match. Please try again.
      </error-tip>
    </div>
    <div class="login-tfa-form__actions">
      <slot
        name="actions"
        :confirm-disabled="confirmDisabled"
      />
    </div>
    <a
      class="login-tfa-form__help"
      :href="supportLink"
      target="_blank"
    >Get Help</a>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'

import ErrorTip from '@/components/Common/ErrorTip/ErrorTip.vue'

import LoginTfaNumberCell from './LoginTfaNumberCell.vue'

@Component({
  name: 'login-tfa-form',
  components: { ErrorTip, LoginTfaNumberCell }
})
export default class LoginTfaForm extends Vue {
  @Prop({ required: false, type: String, default: null })
  token!: string | null

  @Prop({ required: false, type: Boolean, default: false })
  showError!: boolean

  digits: (number | null)[] = [null, null, null, null, null, null]
  currentIndex: number = 0
  readonly supportLink = 'https://support.google.com/accounts/answer/185834?hl=en'
  readonly appStoreLink = 'https://apps.apple.com/us/app/google-authenticator/id388497605'

  get confirmDisabled () {
    return this.digits.filter(d => d !== null).length < 6
  }

  get digitToken () {
    return this.digits.map(d => `${d}`).join('')
  }

  @Watch('showError')
  onShowError () {
    if (this.showError) {
      this.reset()
    }
  }

  @Watch('digitToken')
  onDigitToken () {
    this.$emit('update:token', this.digitToken)
  }

  mounted () {
    document.addEventListener('keydown', this.onKeyDown)
    this.$once('hook:beforeDestroy', () => {
      document.removeEventListener('keydown', this.onKeyDown)
    })
  }

  onKeyDown (event: KeyboardEvent) {
    event.preventDefault()
    event.stopPropagation()

    if (event.key === 'Enter' && !this.confirmDisabled) {
      this.onConfirm()
      return
    }

    if (event.key === 'Backspace' && this.currentIndex >= 0) {
      this.currentIndex = Math.max(this.currentIndex - 1, 0)
      Vue.set(this.digits, this.currentIndex, null)
      return
    }

    if (event.key.match(/^\d$/) && this.currentIndex < 6) {
      const digit = parseInt(event.key, 10)
      Vue.set(this.digits, this.currentIndex, digit)
      this.currentIndex = this.currentIndex + 1
      if (this.currentIndex === 6) {
        this.$nextTick(() => this.onConfirm())
      }
    }
  }

  reset () {
    this.digits = [null, null, null, null, null, null]
    this.currentIndex = 0
  }

  onConfirm () {
    if (this.confirmDisabled) { return }
    this.$emit('confirm')
  }
}
</script>

<style lang="scss" scoped>
.login-tfa-form {
  width: 100%;
  height: 100%;
  @include col;
  padding: 50px;
}

.login-tfa-form__title {
  width: 100%;
  @include typography(xl-1, inter, bold);
  text-align: center;
  color: $color90Black;
  margin-bottom: 20px;
}

.login-tfa-form__description {
  @include typography(md-1, inter);
  text-align: center;
  color: $color90Black;
  margin-bottom: 20px;
}

.login-tfa-form__ga-link {
  color: $colorFeatherLight;
  @include typography(md-1, inter, bold);
  text-decoration-line: underline;
}

.login-tfa-form__numbers {
  width: 100%;
  @include row;
  align-items: center;
  justify-content: space-evenly;
  margin: 10px 0 7px 0;
}

.login-tfa-form__number {
  &:nth-child(3) {
    margin-right: 6px;
  }
  &:nth-child(4) {
    margin-left: 6px;
  }
}

.login-tfa-form__error {
  width: 100%;
  height: 14px;
  margin-bottom: 20px;
}

.login-tfa-form__actions {
  width: 100%;
  @include row;
  justify-content: space-around;
  margin-bottom: 10px;
  column-gap: 15px;

  > * {
    flex: 1;
    min-width: 160px;
    padding-left: 0;
    padding-right: 0;
  }

  > :first-child {
    justify-self: start;
  }

  > :last-child {
    justify-self: end;
  }

  > :only-child {
    justify-self: center;
  }
}

.login-tfa-form__help {
  @include typography(sm, inter, bold);
  text-decoration-line: underline;
  color: $colorFeatherTeal;
  margin-bottom: 10px;
}
</style>
