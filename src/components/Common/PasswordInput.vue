<template>
  <input-field
    v-model="password"
    class="password-input"
    name="password"
    type="password"
    label="Password"
    theme="light"
    :error="error"
    hint="Password needs to have at least 8 characters"
    required="required"
    :autocomplete="autocomplete"
  >
    <div
      v-if="password && passwordIssues.length === 0"
      slot="modifier"
      class="password-input__strong"
    >
      <div class="password-input__strong__dot" />
      <label>Strong Password</label>
    </div>
    <div
      v-if="password && passwordIssues.length > 0"
      slot="modifier"
      class="password-input__weak"
    >
      <label>{{ passwordIssues[0] }}</label>
    </div>
  </input-field>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'

import InputField from '@/components/Common/InputField/V1/InputField.vue'
import { validatePassword } from '@/utils'

@Component({
  name: 'password-input',
  components: { InputField }
})
export default class PasswordInput extends Vue {
  @Prop({ required: true, type: String })
  value!: string

  @Prop({ required: false, type: String, default: 'password' })
  autocomplete!: string

  @Prop({ required: false, type: String })
  error?: string

  passwordIssues: Array<string> = []

  get password () {
    return this.value
  }

  set password (val: string) {
    this.$emit('input', val)
  }

  @Watch('password')
  onPassword () {
    this.passwordIssues = validatePassword(this.password)
  }
}
</script>

<style lang="scss" scoped>
.password-input__strong {
  position: absolute;
  @include row--center;
  @include typography(md, default, bold);
  right: 5px;
  text-align: right;
  white-space: nowrap;
  color: $colorPrimaryLight;
}

.password-input__strong__dot {
  position: absolute;
  left: -10px;
  width: 0;
  height: 0;
  border-radius: 3px;
  border: 3px solid $colorPrimaryLight;
}

.password-input__weak {
  position: absolute;
  @include row--center;
  @include typography(md, default, bold);
  right: 5px;
  text-align: right;
  color: $colorYellow;
  white-space: nowrap;
}
</style>
