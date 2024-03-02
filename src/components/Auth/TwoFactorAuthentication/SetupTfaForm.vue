<template>
  <div class="setup-tfa-form">
    <h1 class="setup-tfa-form__title">
      Set up 2-Factor Authentication
    </h1>
    <div class="setup-tfa-form__instructions">
      <div class="setup-tfa-form__li">
        <span class="setup-tfa-form__li-title">
          1. Get an Authenticator app from the
          <a
            class="setup-tfa-form__ga-link"
            :href="appStoreLink"
            target="_blank"
          >App Store</a>
        </span>
        <span class="setup-tfa-form__li-tip">
          Don’t want to use Google Authenticator?
          <a
            class="setup-tfa-form__other-link"
            :href="otherStoreLink"
            target="_blank"
          >Browse other options.</a>
        </span>
      </div>
      <div class="setup-tfa-form__li">
        <span class="setup-tfa-form__li-title">
          2. Within the app, select <b>Set up account</b>
        </span>
      </div>
      <div class="setup-tfa-form__li">
        <span class="setup-tfa-form__li-title">
          3. Choose <b>Scan barcode</b>
        </span>
      </div>
    </div>
    <div class="setup-tfa-form__qr-code-section">
      <div class="setup-tfa-form__qr-code">
        <vue-qrcode
          tag="svg"
          :options="{ width: qrcodeWidth }"
          :value="qrCodeValue"
        />
      </div>
    </div>
    <div class="setup-tfa-form__qr-code__actions">
      <slot name="actions" />
    </div>
  </div>
</template>

<script lang="ts">
import VueQrcode from '@chenfengyuan/vue-qrcode'
import { Component, Prop, Vue } from 'vue-property-decorator'

@Component({
  name: 'setup-tfa-form',
  components: { VueQrcode }
})
export default class SetupTfa extends Vue {
  @Prop({ required: true })
  email!: string

  @Prop({ required: true })
  secretKey!: string | null

  get qrCodeValue () {
    return `otpauth://totp/V7%20(${this.email})?secret=${this.secretKey}`
  }

  get appStoreLink () {
    return 'https://apps.apple.com/us/app/google-authenticator/id388497605'
  }

  get otherStoreLink () {
    return 'https://apps.apple.com/us/app/microsoft-authenticator/id983156458'
  }

  get qrcodeWidth () {
    const width = this.$theme.getCurrentScale() * 114
    return `${width}px`
  }
}
</script>

<style lang="scss" scoped>
.setup-tfa-form {
  width: 100%;
  height: 100%;
  @include col;
  padding: 50px;
  row-gap: 20px;
}

.setup-tfa-form__title {
  width: 100%;
  @include typography(xl-1, inter, bold);
  text-align: center;
  color: $color90Black;
}

.setup-tfa-form__instructions {
  width: 100%;
  @include col;
  row-gap: 6px;
}

.setup-tfa-form__li {
  @include col;
  row-gap: 6px;
}

.setup-tfa-form__li-title {
  @include typography(md-1, inter);
  color: $color90Black;

  b {
    font-weight: bold;
  }
}

.setup-tfa-form__li-tip {
  @include typography(sm, inter);
  color: $colorAliceNight;
  margin-left: 16px;
}

.setup-tfa-form__ga-link {
  color: $colorFeatherLight;
  @include typography(md-1, inter, bold);
  text-decoration-line: underline;
}

.setup-tfa-form__other-link {
  color: $colorAliceNight;
  text-decoration-line: underline;
}

.setup-tfa-form__qr-code-section {
  width: 100%;
  @include col--center;
  row-gap: 10px;
}

.setup-tfa-form__qr-code {
  @include col--center;
  width: 114px;
  height: 114px;
}

.setup-tfa-form__tip {
  @include typography(md, inter);
  text-align: center;
  color: $colorAliceNight;
}

.setup-tfa-form__qr-code__actions {
  width: 100%;
  @include row;
  justify-content: space-around;
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
</style>
