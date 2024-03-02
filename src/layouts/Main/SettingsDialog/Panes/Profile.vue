<template>
  <settings-pane
    title="Profile"
    tag="form"
    @submit.native.prevent="maybeSubmit"
  >
    <template #body>
      <div
        v-if="profile"
        class="profile__body"
      >
        <div class="profile__display">
          <avatar-upload
            can-upload
            show-change
            :src="avatarUrl"
            :disabled="loading"
            :loading="avatarData && loading"
            :name="fullName"
            @change="onAvatarChange"
          >
            <template #placeholder>
              Upload Avatar
            </template>
          </avatar-upload>
          <div class="profile__info">
            <div class="profile__name">
              {{ fullName }}
            </div>
            <small
              class="profile__tips"
            >This profile is your global profile, that is used in any team you are part of.</small>
            <div class="row">
              <div class="profile__pair">
                <div class="profile__key">
                  Account created
                </div>
                <div class="profile__value">
                  {{ createdAt }}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="profile__edit">
          <div class="profile__edit__title">
            Personal Details
          </div>
          <div class="row--distributed">
            <div class="settings_pane__form-group">
              <input-field
                ref="firstName"
                v-model="firstName"
                type="text"
                name="firstName"
                label="First Name"
                theme="light"
                autocomplete="given-name"
              />
            </div>
            <div class="settings_pane__form-group">
              <input-field
                ref="lastName"
                v-model="lastName"
                type="text"
                name="lastName"
                label="Last Name"
                theme="light"
                autocomplete="family-name"
              />
            </div>
          </div>
          <div class="row--distributed">
            <div class="settings_pane__form-group">
              <div class="settings_pane__form-label">
                E-Mail Address
              </div>
              <div class="settings_pane__form-input">
                <span>{{ profile.email }}</span>
              </div>
            </div>
            <div class="settings_pane__form-group">
              <div class="settings_pane__form-label">
                Password
              </div>
              <div
                v-if="!showChangePassword"
                class="settings_pane__form-input"
              >
                <secondary-button
                  class="change__button"
                  size="small"
                  type="button"
                  @click="changePassword"
                >
                  CHANGE PASSWORD
                </secondary-button>
              </div>
              <password-change
                v-else
                ref="passwordChange"
                class="settings_pane__password-change"
                require-old-password
                :old-password.sync="oldPassword"
                :password.sync="password"
                :password-confirmation.sync="passwordConfirmation"
              />
            </div>
          </div>
          <div class="row--distributed">
            <div class="settings_pane__form-group">
              <check-box
                ref="enableTwoFactorAuthentication"
                v-model="enableTwoFactorAuthentication"
                label="Enable two factor authentication"
                name="enableTwoFactorAuthentication"
                :disabled="twoFactorEnforced"
              />
            </div>
            <div
              v-if="enableTwoFactorAuthentication"
              class="settings_pane__form-group"
            >
              <secondary-button
                class="configure_tfa"
                size="small"
                type="button"
                @click="configure2fa"
              >
                CONFIGURE 2FA
              </secondary-button>
            </div>
          </div>
        </div>
        <div class="profile__delete">
          <button
            type="button"
            class="profile__delete__title"
            @click="onDeleteAccount"
          >
            Delete My Account
          </button>
          <br>
          <small>
            This will delete all personal datasets, leave all shared datasets,
            and delete your user account.
          </small>
        </div>
      </div>
    </template>
    <template #footer>
      <positive-button
        type="submit"
        :disabled="loading"
      >
        Save
      </positive-button>
    </template>

    <delete-confirmation-dialog
      ref="deleteConfirmationDialog"
      title="Please confirm you wish to delete your account"
      detail="Deleting your account can't be undone later on.
              Please confirm conscientiously that you want to delete this account."
      button-text="DELETE ACCOUNT"
      @confirmed="deleteAccount"
    />

    <setup-tfa-modal
      :setup-required="!profile.two_factor_auth_enabled"
      @confirmed="onTfaConfirmed"
    />
  </settings-pane>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'
import { State } from 'vuex-class'

import PasswordChange from '@/components/Auth/PasswordChange.vue'
import AvatarUpload from '@/components/Common/AvatarUpload/AvatarUpload.vue'
import { AvatarUploadData } from '@/components/Common/AvatarUpload/types'
import CheckBox from '@/components/Common/CheckBox/V1/CheckBox.vue'
import { DeleteConfirmationDialog } from '@/components/Common/DeleteConfirmationDialog/V1'
import InputField from '@/components/Common/InputField/V1/InputField.vue'
import SetupTfaModal from '@/components/Layout/SettingsDialog/SetupTfaModal.vue'
import { UpdateProfileActionParams } from '@/store/modules/user/actions/updateProfile'
import { RootState, TeamPayload, UserPayload, ValidationErrors } from '@/store/types'
import { getFullName, formatDate } from '@/utils'

import SettingsPane from './SettingsPane.vue'

@Component({
  name: 'profile',
  components: {
    AvatarUpload,
    CheckBox,
    DeleteConfirmationDialog,
    InputField,
    PasswordChange,
    SettingsPane,
    SetupTfaModal
  }
})
export default class Profile extends Vue {
  firstName: string = ''
  lastName: string = ''
  oldPassword: string = ''
  password: string = ''
  passwordConfirmation: string = ''
  showChangePassword: boolean = false
  loading: boolean = false
  avatarData: AvatarUploadData | null = null
  enableTwoFactorAuthentication: boolean = false
  tfaConfigured: boolean = false

  $refs!: {
    deleteConfirmationDialog: DeleteConfirmationDialog
    firstName: InputField
    lastName: InputField
    passwordChange: PasswordChange
  }

  @State((state: RootState) => state.user.profile)
  profile!: UserPayload

  @State((state: RootState) => state.team.currentTeam)
  team!: TeamPayload

  get avatarUrl () {
    const { profile } = this
    return profile.image && (profile.image.thumbnail_url || profile.image.url)
  }

  get createdAt () {
    return (this.profile && this.profile.inserted_at)
      ? formatDate(this.profile.inserted_at, 'YYYY-MM-DD')
      : ''
  }

  get fullName () {
    return this.profile ? getFullName(this.profile) : ''
  }

  get twoFactorEnforced () {
    return this.team.two_factor_auth_enforced
  }

  @Watch('profile', { immediate: true })
  onProfile () {
    this.updateData()
  }

  @Watch('team', { immediate: true })
  onTeam () {
    this.updateData()
  }

  public created () {
    this.updateData()
  }

  updateData () {
    const { profile, team } = this
    if (!profile) { return }
    this.firstName = profile.first_name
    this.lastName = profile.last_name
    this.enableTwoFactorAuthentication =
      profile.two_factor_auth_enabled || team.two_factor_auth_enforced
  }

  changePassword () {
    this.showChangePassword = true
  }

  resetChangePasswordForm () {
    this.oldPassword = ''
    this.password = ''
    this.passwordConfirmation = ''
  }

  onDeleteAccount () {
    this.$refs.deleteConfirmationDialog.show()
  }

  async deleteAccount () {
    this.loading = true
    const { error } = await this.$store.dispatch('user/deleteProfile')

    this.$refs.deleteConfirmationDialog.close()
    this.loading = false

    if (error) {
      return this.$store.dispatch('toast/warning', { content: error.message })
    }

    this.$store.dispatch('auth/logout')
  }

  onAvatarChange (event: AvatarUploadData) {
    this.avatarData = event
  }

  configure2fa () {
    this.$modal.show('setup-tfa-modal')
  }

  async onTfaConfirmed () {
    this.tfaConfigured = true
    await this.submit()
  }

  async maybeSubmit () {
    const { enableTwoFactorAuthentication, profile, tfaConfigured } = this
    if (enableTwoFactorAuthentication === profile.two_factor_auth_enabled) {
      await this.submit()
      return
    }
    if (!enableTwoFactorAuthentication) {
      this.configure2fa()
      return
    }
    if (tfaConfigured) {
      return this.submit()
    }

    this.configure2fa()
  }

  async submit () {
    if (this.showChangePassword) {
      this.$refs.passwordChange.validateForm()
      if (!this.$refs.passwordChange.isValid) { return }
    }
    this.loading = true

    const update: UpdateProfileActionParams = {
      first_name: this.firstName,
      last_name: this.lastName,
      two_factor_auth_enabled: this.enableTwoFactorAuthentication,
      ...(this.showChangePassword && {
        old_password: this.oldPassword,
        password: this.password,
        password_confirmation: this.passwordConfirmation
      })
    }

    if (this.avatarData) {
      update.hash = this.avatarData.hash
      update.content = this.avatarData.file
      update.type = this.avatarData.type
    }

    const { error } = await this.$store.dispatch('user/updateProfile', update)

    this.loading = false

    if (error) {
      this.setErrors(error)
      this.$store.dispatch('toast/warning', { content: error.message })
      return
    }

    this.$store.dispatch('toast/notify', { content: 'Profile successfully updated' })
    this.showChangePassword = false
    this.avatarData = null
    this.resetChangePasswordForm()
  }

  setErrors (validationErrors: ValidationErrors) {
    if (this.$refs.firstName) {
      this.$refs.firstName.setError(validationErrors.firstName as string)
    }

    if (this.$refs.lastName) {
      this.$refs.lastName.setError(validationErrors.lastName as string)
    }

    if (this.showChangePassword && this.$refs.passwordChange) {
      this.$refs.passwordChange.setErrors(validationErrors)
    }
  }
}
</script>

<style lang="scss" scoped>
.profile {
  @include col;
  width: 100%;
  height: 100%;

  small {
    @include typography(md, default);
    color: $colorSecondaryLight;
  }
}

.profile__body {
  width: 100%;
  height: 100%;
  @include col;
}

.profile__display {
  @include row;
  align-items: center;
  margin-bottom: 25px;
}

.profile__info {
  margin-left: 30px;
  @include col;
}

.profile__name {
  @include typography(xl, headlines, 500);
  margin-bottom: 10px;
  color: $colorSecondaryDark1;
}

.profile__tips {
  @include typography(md);
  color: $colorSecondaryLight;
  margin-bottom: 13px;
}

.row {
  @include row;
}

.profile__pair {
  @include col;
  margin-right: 30px;
  font-family: $fontFamilyDefault;
}
.profile__key {
  @include typography(md, default);
  margin-bottom: 7px;
  letter-spacing: 0.2px;
  color: $colorSecondaryLight;
}

.profile__value {
  @include typography(md-1, inherit, bold);
  color: $colorSecondaryLight;
}

.profile__edit {
  flex: 1;
  margin: 25px 0;
}

.profile__edit__title {
  @include typography(lg-1, headlines, bold);
  color: $colorSecondaryDark1;
}

.row--distributed {
  @include row--distributed;
}

.change__button {
  font-weight: bold;
}

.configure_tfa {
  font-weight: bold;
}

.profile__delete {
  margin-top: 30px;
}
.profile__delete__title {
  @include typography(md-1, headlines, 500);
  letter-spacing: 0.5px;
  text-transform: uppercase;
  color: $colorPink;
  margin-bottom: 10px;
  padding: 0px;

  &:hover {
    opacity: 0.7;
  }
  &:active {
    opacity: 0.5;
  }
}

.settings_pane__form-group {
  width: calc(50% - 15px);
  margin-top: 25px;
}

.settings_pane__form-label {
  @include typography(md-1, default);
  color: $colorSecondaryLight;
  margin-bottom: 7px;
}

.settings_pane__form-input {
  width: 100%;
}

.settings_pane__password-change {
  width: 100%;
}
</style>
