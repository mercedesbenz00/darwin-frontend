<template>
  <div class="sso__setting">
    <div class="setting__body">
      <div
        v-if="$can('update_team')"
        class="team__body__section team__body__sso"
        :class="{ 'team-body__enforce--disabled': enforcingSSODisabled }"
      >
        <radio
          id="ssoAuthEnforced"
          v-tooltip="hasSSOConfig ? null : { content: 'You need to set up the SSO config first.' }"
          name="sso_or_2fa"
          :selected="ssoAuthEnforced"
          :value="true"
          label="Enforce SSO"
          :disabled="enforcingSSODisabled || !hasSSOConfig"
          @input="onSelectSSO"
        />
        <div class="team__body__icon-wrapper">
          <div
            v-if="enforcing2faDisabled"
            class="team__body__enforce-upgrade-icon"
          >
            <upgrade-tfa-icon
              v-tooltip="{ content: 'Upgrade to Enterprise to unlock this feature' }"
              @click="upgradeToEnterprise"
            />
          </div>
        </div>
      </div>
      <div
        v-if="$can('update_team')"
        class="team__body__section"
        :class="{ 'team-body__enforce--disabled': enforcing2faDisabled }"
      >
        <radio
          id="twoFactorAuthEnforced"
          name="sso_or_2fa"
          :selected="twoFactorAuthEnforced"
          :value="true"
          label="Enforce Two Factor Authentication"
          :disabled="enforcing2faDisabled"
          @input="onSelect2fa"
        />
        <div class="team__body__icon-wrapper">
          <div
            v-if="enforcing2faDisabled"
            class="team__body__enforce-upgrade-icon"
          >
            <upgrade-tfa-icon
              v-tooltip="{ content: 'Upgrade to Enterprise to unlock this feature' }"
              @click="upgradeToEnterprise"
            />
          </div>
        </div>
      </div>
      <h4 class="setting__header">
        SSO
      </h4>
      <small
        class="setting__tips"
      >Let colleagues join your team using Single Sign-On</small>
      <div class="role__body">
        <div class="members__new__role">
          <role-dropdown
            id="role"
            ref="defaultRole"
            :value="defaultRole"
            name="role"
            label="Default Role"
            placeholder="Role"
            :disabled="enforcingSSODisabled || !hasSSOConfig"
            :options="membershipRoleOptions"
            @input="$emit('update:default-role', $event)"
          />
          <small
            class="setting__tips"
          >A user who signs up using SSO automatically joins your team with this role</small>
        </div>
      </div>
      <div class="saml__body">
        <div class="setting__sub-cell">
          <h5 class="setting__sub-header">
            SAML
          </h5>
        </div>
        <div
          id="saml__configure"
          class="setting__sub-cell cell-field"
        >
          <secondary-button
            class="full-width"
            type="button"
            :disabled="enforcingSSODisabled"
            @click="openSSOConfig"
          >
            Configure SSO
          </secondary-button>
        </div>
      </div>
      <div class="google__body">
        <div class="setting__sub-cell">
          <h5 class="setting__sub-header">
            Google Auth 2.0
          </h5>
        </div>
        <div class="setting__sub-cell cell-field">
          <input-field
            id="businessDomain"
            :value="businessDomain"
            :disabled="(currentPlan !== 'enterprise') && !ssoAuthEnforced"
            type="text"
            label="Business Domain"
            placeholder="i.e. @v7labs.com"
            theme="light"
            :error="error && error.domain"
            @input="$emit('update:business-domain', $event)"
          />
          <div :class="{ 'error-msg-padding': error && error.domain!=null }">
            <small
              class="setting__tips"
            >
              Users with this domain will automatically be added to
              your team when signing in with Google Auth 2.0 for the first time.
            </small>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch, Prop } from 'vue-property-decorator'
import { Getter, State } from 'vuex-class'

import UpgradeTfaIcon from '@/assets/icons/V1/upgrade-tfa.svg?inline'
import CheckBox from '@/components/Common/CheckBox/V1/CheckBox.vue'
import InputField from '@/components/Common/InputField/V1/InputField.vue'
import Radio from '@/components/Common/Radio.vue'
import RoleDropdown from '@/components/Common/RoleDropdown.vue'
import { RoleDropdownOption } from '@/components/Common/RoleDropdownOption'
import { TeamPayload, RootState, ValidationError } from '@/store/types'

import SettingsPane from './SettingsPane.vue'
import { membershipRoleOptions } from './TeamMembers/data'

@Component({
  name: 'team-sso',
  components: {
    CheckBox,
    InputField,
    Radio,
    RoleDropdown,
    SettingsPane,
    UpgradeTfaIcon
  }
})
export default class TeamSso extends Vue {
  @Prop({ required: false, type: Object as () => ValidationError })
  error?: ValidationError

  @Prop({ required: true, type: Boolean, default: false })
  twoFactorAuthEnforced!: boolean

  @Prop({ required: true, type: Boolean, default: false })
  ssoAuthEnforced!: boolean

  @Prop({ default: '' })
  businessDomain!: string | undefined

  @Prop({ default: 'member' })
  defaultRole!: string | undefined

  @Prop({ required: false, type: String, default: '' })
  currentPlan!: string

  @State((state: RootState) => state.team.currentTeam)
  team!: TeamPayload

  @Getter('hasConfig', { namespace: 'sso' })
  hasSSOConfig!: boolean

  get enforcing2faDisabled (): boolean {
    return !this.team.enforcing_two_factor_auth_allowed
  }

  get enforcingSSODisabled (): boolean {
    return !this.team.enforcing_sso_allowed
  }

  get membershipRoleOptions (): RoleDropdownOption[] {
    return membershipRoleOptions(this.$can)
  }

  @Watch('team')
  onTeam () {
    this.updateData()
  }

  created () {
    this.updateData()

    if (this.$can('update_team')) {
      this.$store.dispatch('sso/loadConfig')
    }
  }

  updateData () {
    if (!this.team) { return }
    this.$emit('update:two-factor-auth-enforced', this.team.two_factor_auth_enforced)
    this.$emit('update:sso-auth-enforced', this.team.sso_enforced)
    this.$emit('update:default-role', this.team.default_role)
    this.$emit('update:business-domain', this.team.email_domain || '')
  }

  onSelectSSO (): void {
    this.$emit('update:sso-auth-enforced', !this.ssoAuthEnforced)
    this.$emit('update:two-factor-auth-enforced', false)
    this.$emit('update:business-domain', this.team.email_domain || '')
  }

  onSelect2fa (): void {
    this.$emit('update:sso-auth-enforced', false)
    this.$emit('update:two-factor-auth-enforced', !this.twoFactorAuthEnforced)
    this.$emit('update:business-domain', '')
  }

  upgradeToEnterprise (): void {
    this.$emit('upgrade-to-enterprise')
  }

  openSSOConfig () {
    this.$emit('open-sso-config')
  }
}
</script>

<style lang="scss" scoped>
.sso__setting, .general__setting {
  display: flex;
  flex-direction: column;
  margin-bottom: 16px;

  .team__body__section {
    margin-bottom: 25px;
    flex: 50px;
    display: flex;
    align-items: center;
  }
}

.team__body__sso {
  display: flex;
  align-items: center;
  width: 19.25rem;

  button {
    height: auto;
    padding: calc($defaultSpace / 4) calc($defaultSpace / 2);
  }
}

.saml__body, .google__body {
  display: block;
  margin-top: 12px;
  margin-bottom: 12px;
  padding-left: 12px;
}

.setting__sub-cell {
  flex: 1;
}

.setting__tips {
  @include typography(md);
  color: $colorSecondaryLight;
  margin-bottom: 13px;
}

.cell-field {
  width: 50%;
  margin-top: 8px;
}

.members__new__role {
  width: calc(19.25rem + 6px + 7px); // Width + Margins
  margin-right: 30px;
}

.full-width {
  width: 100%;
}

.role__body {
  margin-top: 12px;
  margin-bottom: 12px;
}

.team__body__section :deep(.check-box__label__text) {
  color: $color90Black;
  @include typography(md-1, headlines, 500);
}

.team-body__enforce--disabled {
  position: relative;
  width: calc(19.25rem + 6px + 7px); // Width + Margins
  @include row;
  align-items: center;
  box-sizing: border-box;
  padding: 6px 7px 6px 7px;
  margin-left: -7px;
  background: rgba(222, 255, 252, 0.5);
  border-radius: 10px;

  :deep(.check-box--disabled) {
    opacity: 1.0;
  }
}

.team__body__enforce-upgrade-icon {
  margin-left: auto;
  position: relative;
  display: block;
  width: 20px;
  height: 20px;

  svg {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    outline: none;
    cursor: pointer;

    &:active {
      outline: none;
    }
  }
}

.team__body__icon-wrapper {
  flex: 60px;
  display: flex;
  justify-self: flex-end;
}
.error-msg-padding {
  margin-top: 12px;
}
</style>
