<template>
  <form
    class="register-form"
    @submit.prevent="onSignup"
  >
    <avatar-upload
      class="register-form__avatar"
      can-upload
      :disabled="loading"
      :loading="avatarData && loading"
      @change="onAvatarChange"
    />
    <div class="register-form__input-container">
      <div class="register-form__first__name">
        <input-field
          v-model="firstName"
          label="First Name"
          theme="light"
          :error="error.firstName"
          required="required"
          autocomplete="first_name"
        />
      </div>
      <div class="register-form__last__name">
        <input-field
          v-model="lastName"
          label="Last Name"
          theme="light"
          :error="error.lastName"
          required="required"
          autocomplete="last_name"
        />
      </div>
    </div>
    <div class="register-form__input-container">
      <div class="register-form__email">
        <input-field
          v-model="email"
          disabled
          type="email"
          label="Email"
          theme="light"
          :error="error.email"
          required="required"
          autocomplete="email"
        />
      </div>
    </div>
    <div class="register-form__input-container">
      <div class="register-form__password">
        <password-input
          v-model="password"
          autocomplete="new-password"
          :error="error.password"
        />
      </div>
    </div>
    <div class="register-form__agreement">
      <check-box
        id="agreedToTos"
        v-model="agreedToTos"
        name="agreedToTos"
        size="small"
        :label="agreedToTosLabel"
        disable-label-click
      />
    </div>
    <div class="register-form__actions">
      <google-auth-button
        :is-register="true"
        :is-disabled="!agreedToTos || loading"
        :token="token"
      />
      <primary-button
        class="register__form__submit"
        type="submit"
        :disabled="!agreedToTos || loading"
      >
        Sign up
      </primary-button>
    </div>
  </form>
</template>

<script lang="ts">
import isEmail from 'validator/lib/isEmail'
import isEmpty from 'validator/lib/isEmpty'
import { Component, Prop, Vue } from 'vue-property-decorator'

import GoogleAuthButton from '@/components/Auth/GoogleAuthButton.vue'
import AvatarUpload from '@/components/Common/AvatarUpload/AvatarUpload.vue'
import { AvatarUploadData } from '@/components/Common/AvatarUpload/types'
import CheckBox from '@/components/Common/CheckBox/V1/CheckBox.vue'
import InputField from '@/components/Common/InputField/V1/InputField.vue'
import PasswordInput from '@/components/Common/PasswordInput.vue'
import { ConfirmInvitationActionParams } from '@/store/modules/auth/actions/confirmInvitation'
import { RegisterActionParams } from '@/store/modules/auth/actions/register'
import { UploadProfileAvatarActionParams } from '@/store/modules/user/actions/uploadProfileAvatar'
import { validatePassword } from '@/utils'

type RegisterError = {
  firstName?: string
  lastName?: string
  email?: string
  password?: string
  agreedToTos?: string
}

@Component({
  name: 'register-form',
  components: {
    AvatarUpload,
    CheckBox,
    InputField,
    GoogleAuthButton,
    PasswordInput
  }
})
export default class RegisterForm extends Vue {
  @Prop({ required: true, type: String })
  email!: string

  @Prop({ required: true, type: Boolean })
  isTeamInvitation!: boolean

  @Prop({ required: false, type: String, default: '' })
  token!: string

  avatarData: AvatarUploadData | null = null
  firstName: string = ''
  lastName: string = ''
  password: string = ''
  agreedToTos: boolean = false

  error: RegisterError = {}
  loading: boolean = false

  validateForm () {
    this.error = {}
    // Validate the form
    if (isEmpty(this.firstName)) {
      this.error.firstName = 'First Name cannot be empty'
    }

    if (isEmpty(this.lastName)) {
      this.error.lastName = 'Last Name cannot be empty'
    }

    if (isEmpty(this.email)) {
      this.error.email = 'Email cannot be empty'
    } else if (!isEmail(this.email)) {
      this.error.email = 'Should be the valid email'
    }

    if (!this.agreedToTos) {
      this.error.agreedToTos = 'You must accept the terms and conditions'
    }

    const passwordIssues = validatePassword(this.password)
    if (passwordIssues.length > 0) {
      this.error.password = passwordIssues[0]
    }

    return Object.keys(this.error).length === 0
  }

  onAvatarChange (event: AvatarUploadData) {
    this.avatarData = event
  }

  async onSignup () {
    if (!this.agreedToTos) {
      this.$ga.event('signup', 'submit', 'failure_terms_not_accepted')
      return
    }

    if (!this.validateForm()) {
      this.$ga.event('signup', 'submit', 'failure_form_invalid')
      return
    }

    const { email, password, firstName, lastName, agreedToTos, avatarData } = this
    const params: RegisterActionParams | ConfirmInvitationActionParams = {
      email,
      password,
      firstName,
      lastName,
      hash: avatarData ? avatarData.hash : undefined,
      twoFactorAuthEnabled: false,
      agreedToTos,
      token: this.$route.query.token as string
    }

    const { error } = this.isTeamInvitation
      ? await this.$store.dispatch('auth/register', params)
      : await this.$store.dispatch('auth/confirmInvitation', params)

    if (error) {
      if (error.isValidationError) {
        this.error = error
      } else {
        this.error = {}
        this.$store.dispatch('toast/warning', { content: error.message })
      }

      this.$ga.event('signup', 'submit', 'failure_request_failed', error.code)
      return
    }

    this.error = {}

    if (avatarData) {
      await this.uploadAvatar()
    }

    this.$ga.event('signup', 'submit', 'success_email_confirmed')

    this.$store.commit('auth/SET_2FA_CREDENTIALS', {
      email: this.email,
      password: this.password
    })
    this.$emit('submitted')
  }

  async uploadAvatar () {
    const { avatarData } = this
    if (!avatarData) { return }

    const params: UploadProfileAvatarActionParams = {
      content: avatarData.file,
      type: avatarData.type
    }

    const { error } = await this.$store.dispatch('user/uploadProfileAvatar', params)
    if (error) {
      this.$store.dispatch('toast/warning', { content: error.message })
    }
  }

  get agreedToTosLabel (): string {
    const termsUrl = 'https://www.v7labs.com/terms'
    const termsLink =
      `<a href="${termsUrl}" class='terms-link' target='_blank'>Terms and Conditions</a>`

    const privacyUrl = 'https://www.v7labs.com/terms/dps'
    const privacyLink =
      `<a href='${privacyUrl}'class='terms-link' target='_blank'>Privacy Statement</a>`

    return `I accept the ${termsLink}&nbsp;and${privacyLink}`
  }
}
</script>

<style lang="scss" scoped>
.register-form {
  width: 520px;
  height: 556px;
  @include col;
  align-items: center;
  justify-content: flex-end;
  position: relative;
  padding-bottom: 30px;
  background-color: $colorWhite;
  border-radius: 0px $border-radius-default $border-radius-default 0px;
  box-shadow: 0 20px 30px 10px rgba(145, 169, 192, 0.3);
}

.register-form__avatar {
  position: absolute;
  width: 120px;
  height: 120px;
  top: -10px;
}

.register-form__input-container {
  width: 100%;
  @include row--center;
  padding: 13px 50px 12px 70px;
}

.register-form__first__name {
  width: calc(50% - 10px);
  margin-right: 10px;
}

.register-form__last__name {
  width: calc(50% - 10px);
  margin-left: 10px;
}

.register-form__email {
  width: 100%;
}
.register-form__skill {
  width: calc(50% - 10px);
  margin-left: 10px;
}

.register-form__password {
  width: 100%;
  padding-top: 5px;
  margin-bottom: 20px;
}

.register-form__agreement {
  width: 100%;
  @include row;
  padding: 50px 50px 25px 70px;
}

.register-form__actions {
  width: 100%;
  @include row;
  align-items: center;
  justify-content: space-between;
  padding: 20px 50px 12px 70px;
}

.register__form__submit {
  width: 195px;
  margin-left: 5px;
  text-align: center;
}
</style>
