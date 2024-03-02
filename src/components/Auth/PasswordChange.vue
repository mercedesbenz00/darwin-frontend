<template>
  <div class="password-change">
    <div
      v-if="requireOldPassword"
      class="password-change__input"
    >
      <input-field
        name="oldPassword"
        type="password"
        theme="light"
        placeholder="Old Password"
        required="required"
        autocomplete="current-password"
        :error="error.oldPassword"
        :value="oldPassword"
        @input="$emit('update:old-password', $event)"
      />
    </div>
    <div class="password-change__input">
      <password-input
        autocomplete="new-password"
        :error="error.password"
        :value="password"
        @input="$emit('update:password', $event)"
      />
    </div>
    <div class="password-change__input">
      <input-field
        name="passwordConfirmation"
        type="password"
        theme="light"
        placeholder="Confirm Password"
        required="required"
        autocomplete="new-password"
        :error="error.passwordConfirmation"
        :value="passwordConfirmation"
        @input="$emit('update:password-confirmation', $event)"
      />
    </div>
  </div>
</template>

<script lang="ts">
import isEmpty from 'validator/lib/isEmpty'
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'

import InputField from '@/components/Common/InputField/V1/InputField.vue'
import PasswordInput from '@/components/Common/PasswordInput.vue'
import { validatePassword } from '@/utils'

type PasswordChangeError = {
  oldPassword?: string
  password?: string
  passwordConfirmation?: string
}

@Component({
  name: 'password-change',
  components: { InputField, PasswordInput }
})
export default class PasswordChage extends Vue {
  @Prop({ required: true, type: String })
  password!: string

  @Prop({ required: true, type: String })
  passwordConfirmation!: string

  @Prop({ type: Boolean, default: false })
  requireOldPassword!: boolean

  @Prop({ type: String, default: '' })
  oldPassword!: string

  error: PasswordChangeError = {}

  public get isValid () {
    return Object.keys(this.error).length === 0
  }

  @Watch('passwordConfirmation')
  onPasswordConfirmation () {
    this.error.passwordConfirmation = ''
  }

  validateForm () {
    this.error = {}

    const passwordIssues = validatePassword(this.password)
    if (passwordIssues.length > 0) {
      this.error.password = passwordIssues[0]
    }

    if (isEmpty(this.passwordConfirmation)) {
      this.error.passwordConfirmation = 'Confirm password cannot be empty'
    } else if (this.password !== this.passwordConfirmation) {
      this.error.passwordConfirmation = 'You must enter the same password'
    }
    return Object.keys(this.error).length === 0
  }

  setErrors (error: PasswordChangeError) {
    if (!error) { return }

    this.error = {}
    if (error.oldPassword) {
      this.error.oldPassword = error.oldPassword
    }
    if (error.password) {
      this.error.password = error.password
    }
    if (error.passwordConfirmation) {
      this.error.passwordConfirmation = error.passwordConfirmation
    }
  }
}
</script>

<style lang="scss" scoped>
.password-change {
  width: 100%;
  @include col--center;
}

.password-change__input {
  width: 100%;
  padding-top: 5px;
  margin-bottom: 20px;
}

.password-change__strong {
  position: absolute;
  @include row--center;
  @include typography(md, default, bold);
  right: 5px;
  text-align: right;
  white-space: nowrap;
  color: $colorPrimaryLight;
}

.password-change__weak {
  position: absolute;
  @include row--center;
  @include typography(md, default, bold);
  right: 5px;
  text-align: right;
  color: $colorYellow;
  white-space: nowrap;
}

.password-change__strong__dot {
  position: absolute;
  left: -10px;
  width: 0;
  height: 0;
  border-radius: 3px;
  border: 3px solid $colorPrimaryLight;
}
</style>
