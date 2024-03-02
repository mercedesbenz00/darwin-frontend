<template>
  <settings-pane
    title="Team Settings"
    tag="form"
    @submit.native.prevent="submit"
  >
    <template #body>
      <div class="team__body">
        <div class="team__body__section">
          <div class="team__body__section__content team__body__section__content--row">
            <avatar-upload
              show-change
              :src="avatarUrl"
              :can-upload="$can('update_team')"
              :company-url="companyUrl"
              :disabled="loading"
              :loading="!!avatarData && loading"
              :name="teamDisplayName"
              @change="onAvatarChange"
            >
              <template #placeholder>
                Upload Avatar
              </template>
            </avatar-upload>
            <div class="team__info">
              <partner-pill
                v-if="isPartner"
                class="team__info__pill"
              />
              <input-field
                v-if="$can('update_team')"
                ref="teamName"
                v-model="teamName"
                type="text"
                name="teamName"
                theme="light"
                placeholder="Team Name"
              />
              <div v-else>
                {{ teamName }}
              </div>
              <div class="team__pair">
                <div class="team__key">
                  Team created
                </div>
                <div class="team__value">
                  {{ createdAt }}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="general__setting">
          <h4 class="setting__header">
            General
          </h4>
          <small
            class="setting__tips"
          >General Settings regarding your team</small>
          <div class="setting__body">
            <div
              v-if="$can('update_team')"
              class="team__body__section"
            >
              <check-box
                ref="teamDisableDatasetSharing"
                v-model="teamDisableDatasetSharing"
                label="Block the ability to share Open Datasets"
                name="teamDisableDatasetSharing"
              />
            </div>
          </div>
        </div>
        <team-sso
          v-if="$can('update_team')"
          :two-factor-auth-enforced.sync="twoFactorAuthEnforced"
          :sso-auth-enforced.sync="ssoAuthEnforced"
          :business-domain.sync="businessDomain"
          :default-role.sync="defaultRole"
          :error="error"
          :current-plan="currentPlan"
          @upgrade-to-enterprise="upgradeToEnterprise"
          @open-sso-config="openSSOConfig"
        />
        <payment-issues class="team__body__section" />
        <client-invite v-if="showPartnerFeatures" />
        <div
          v-if="$can('archive_team')"
          class="team__delete"
        >
          <button
            type="button"
            class="team__delete__title"
            @click="onDelete"
          >
            Delete team {{ teamDisplayName }}
          </button>
          <br>
          <span>This will delete all datasets and remove all members from the team.</span>
        </div>
        <div
          v-else
          class="team__delete"
        >
          <button
            type="button"
            class="team__delete__title"
            @click="onLeave"
          >
            Leave {{ teamDisplayName }}
          </button>
          <br>
          <span>
            This will unassign any Tasks or Datasets associated to your account
            and you will no longer have access to this team.
          </span>
        </div>
      </div>
    </template>
    <template #footer>
      <positive-button
        v-if="$can('update_team')"
        type="submit"
        :disabled="loading"
      >
        Save
      </positive-button>
    </template>

    <delete-confirmation-dialog
      name="delete-team-dialog"
      :title="deleteDialogTitle"
      :detail="deleteDialogDetail"
      :button-text="deleteDialogButtonText"
      @confirmed="onDeleteDialogConfirmed"
    />
    <edit-plan-modal
      initial-plan="enterprise"
      @submit="onPlanUpdateDone"
    />
    <typeform-modal @submit="confirmCancelPlan" />
    <cancel-plan-confirm-modal />
    <switch-open-datasets-dialog />
    <sso-config-modal />
  </settings-pane>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'
import { Getter, State } from 'vuex-class'

import AvatarUpload from '@/components/Common/AvatarUpload/AvatarUpload.vue'
import { AvatarUploadData } from '@/components/Common/AvatarUpload/types'
import CheckBox from '@/components/Common/CheckBox/V1/CheckBox.vue'
import { DeleteConfirmationDialog } from '@/components/Common/DeleteConfirmationDialog/V1'
import Dropdown from '@/components/Common/Dropdown/LegacyDropdown.vue'
import InputField from '@/components/Common/InputField/V1/InputField.vue'
import SsoConfigModal from '@/components/Layout/SettingsDialog/SsoConfigModal.vue'
import ClientInvite from '@/components/PartnerTeam/ClientInvite.vue'
import PartnerPill from '@/components/PartnerTeam/PartnerPill.vue'
import PaymentIssues from '@/components/Plans/PaymentIssues.vue'
import CancelPlanConfirmModal from '@/components/Plans/Product/AnnotationCredits/CancelPlanConfirmModal.vue'
import EditPlanModal from '@/components/Plans/Product/AnnotationCredits/EditPlanModal.vue'
import TypeformModal from '@/components/Plans/Product/AnnotationCredits/TypeformModal.vue'
import SwitchOpenDatasetsDialog from '@/components/Plans/Product/SwitchOpenDatasetsDialog.vue'
import {
  PlanPricing,
  SubscriptionPlanName,
  resolvePlanForCredit
} from '@/components/Plans/Product/utils'
import {
  BillingInfoPayload,
  ProductType
} from '@/store/modules/billing/types'
import { updateTeam } from '@/store/modules/team/actions/updateTeam'
import {
  MembershipPayload,
  RootState,
  StoreActionPayload,
  TeamPayload,
  UserPayload,
  ValidationError
} from '@/store/types'
import { formatDate, getCompanyUrlFromEmail, validateBusinessDomain } from '@/utils'
import { annotationCreditsBilledNextPeriod } from '@/utils/billing'

import SettingsPane from './SettingsPane.vue'
import TeamSso from './TeamSso.vue'

@Component({
  name: 'team-profile',
  components: {
    AvatarUpload,
    CancelPlanConfirmModal,
    CheckBox,
    ClientInvite,
    DeleteConfirmationDialog,
    Dropdown,
    EditPlanModal,
    InputField,
    PartnerPill,
    PaymentIssues,
    SettingsPane,
    SsoConfigModal,
    TeamSso,
    TypeformModal,
    SwitchOpenDatasetsDialog
  }
})
export default class TeamProfile extends Vue {
  teamName: string = ''
  teamDisableDatasetSharing: boolean = false

  loading: boolean = false
  avatarData: AvatarUploadData | null = null
  editPlanBusy: boolean = false
  twoFactorAuthEnforced: boolean = false
  ssoAuthEnforced: boolean = false
  defaultRole: string | undefined = 'member'
  businessDomain: string | undefined = ''
  error: ValidationError = {}

  @State((state: RootState) => state.user.profile)
  user!: UserPayload

  @State((state: RootState) => state.team.currentTeam)
  team!: TeamPayload

  @State(state => state.billing.billingInfo)
  billingInfo!: BillingInfoPayload

  @Getter('relevantTeamMemberships', { namespace: 'team' })
  memberships!: MembershipPayload[]

  $refs!: Vue['$refs'] & {
    teamName: InputField
  }

  get billedNextPeriod (): number {
    return annotationCreditsBilledNextPeriod(this.billingInfo)
  }

  get currentPlan (): SubscriptionPlanName {
    const { billingInfo } = this

    if (billingInfo.freemium) {
      return 'freemium'
    }
    return resolvePlanForCredit(this.billedNextPeriod)
  }

  get avatarUrl (): string | null {
    const { team } = this
    return team.image && (team.image.thumbnail_url || team.image.url)
  }

  get companyUrl (): string | null {
    const owner = this.memberships.find(m => m.role === 'owner')
    if (!owner) { return null }
    return getCompanyUrlFromEmail(owner.email)
  }

  get teamDisplayName (): string {
    return this.team ? this.team.name : ''
  }

  get createdAt (): string {
    return (this.team && this.team.inserted_at)
      ? formatDate(this.team.inserted_at, 'YYYY-MM-DD')
      : ''
  }

  get deleteDialogTitle (): string {
    return this.$can('archive_team')
      ? 'Please confirm you wish to delete this team'
      : 'Please confirm you wish to leave this team'
  }

  get deleteDialogDetail (): string {
    return this.$can('archive_team')
      ? `Deleting a team can't be undone later on.
         Please confirm conscientiously that you want to delete this team.`
      : `Leaving a team can't be undone later on.
         Please confirm conscientiously that you want to leave this team.`
  }

  get deleteDialogButtonText (): string {
    return this.$can('archive_team')
      ? 'DELETE TEAM'
      : 'LEAVE TEAM'
  }

  /**
   * Indicates if current user can manage clients on this team.
   *
   * Backend will provide this ability if the team is a partner team and current
   * user has sufficient privileges.
   */
  get showPartnerFeatures (): boolean {
    return this.$can('manage_client_team', { subject: 'team', resource: this.team })
  }

  /**
   * Indicates if team is a partner team
   */
  get isPartner (): boolean {
    return this.team.managed_status === 'partner'
  }

  @Watch('team')
  onTeam () {
    this.updateData()
    this.$store.dispatch('billing/loadBillingInfo')
  }

  created () {
    this.updateData()
    this.$store.dispatch('billing/loadBillingInfo')
  }

  updateData () {
    if (!this.team) { return }
    this.teamName = this.team.name
    this.teamDisableDatasetSharing = this.team.disable_dataset_sharing
  }

  onAvatarChange (event: AvatarUploadData): void {
    this.avatarData = event
  }

  upgradeToEnterprise (): void {
    this.$modal.show(ProductType.AnnotationCredits)
  }

  onPlanUpdateDone (
    newAmount: number
  ): void {
    if (newAmount < PlanPricing.enterprise) {
      return
    }
    this.$store.dispatch('team/getTeam', this.team.id)
  }

  confirmCancelPlan () {
    this.$modal.show('cancel-plan-confirm-modal')
  }

  validateForm (): boolean {
    this.error = {}

    if (this.businessDomain && this.businessDomain.length) {
      const domainIssues = validateBusinessDomain(this.businessDomain)
      if (domainIssues.length > 0) {
        this.error.domain = domainIssues[0]
      }
    }

    return Object.keys(this.error).length === 0
  }

  async submit () {
    if (!this.validateForm()) {
      return
    }

    this.loading = true
    if (!this.team) { return }

    const { id } = this.team
    const params: StoreActionPayload<typeof updateTeam> = {
      id,
      name: this.teamName,
      disable_dataset_sharing: this.teamDisableDatasetSharing,
      two_factor_auth_enforced: this.twoFactorAuthEnforced,
      sso_enforced: this.ssoAuthEnforced
    }

    if (this.avatarData) {
      params.hash = this.avatarData.hash
      params.content = this.avatarData.file
      params.type = this.avatarData.type || ''
    }

    if (this.ssoAuthEnforced || this.currentPlan === 'enterprise') {
      params.email_domain = this.businessDomain
      params.default_role = this.defaultRole
    }

    const response = await this.$store.dispatch('team/updateTeam', params)

    this.loading = false
    if (response.error) {
      this.error = {}
      this.$refs.teamName.setError(response.error.name)
      this.error.domain = response.error.emailDomain
      return
    }
    this.avatarData = null

    this.$store.dispatch('toast/notify', { content: 'Team Profile successfully updated' })
  }

  openSSOConfig () {
    this.$modal.show('ssoConfig')
  }

  onDelete () {
    this.$modal.show('delete-team-dialog')
  }

  onDeleteDialogConfirmed () {
    if (this.$can('archive_team')) {
      this.onDeleteConfirmed()
    } else {
      this.onLeaveConfirmed()
    }
  }

  async onDeleteConfirmed () {
    this.loading = true
    const { error } = await this.$store.dispatch('team/deleteTeam', this.team)

    this.loading = false
    if (error) {
      this.$store.dispatch('toast/warning', { content: error.message })
      return
    }

    this.$store.dispatch('auth/logout')
  }

  onLeave () {
    this.$modal.show('delete-team-dialog')
  }

  async onLeaveConfirmed () {
    const currentMembership = this.memberships.find(m => m.user_id === this.user.id)
    if (!currentMembership) { return }

    this.loading = true

    const params = { membershipId: currentMembership.id }
    const { error } = await this.$store.dispatch('team/leaveTeam', params)

    this.loading = false
    if (error) {
      this.$store.dispatch('toast/warning', { content: error.message })
      return
    }

    this.$store.dispatch('auth/logout')
  }
}
</script>

<style lang="scss" scoped>
.team__body {
  width: 100%;
  @include col;
  overflow: visible;

  .team__body__title {
    @include typography(md, default, bold);
    color: $colorPrimaryDark;
  }

  .team__body__section {
    margin-bottom: 25px;

    .team__body__section__title {
      @include typography(md, default, bold);
      color: $colorSecondaryDark;
    }

    .team__body__section__content {
      &--row {
        @include row;
      }

      &--row-distributed {
        @include row--distributed;
      }
    }
  }
}

.setting__tips {
  @include typography(md);
  color: $colorSecondaryLight;
  margin-bottom: 13px;
}

.setting__body {
  margin-top: 8px;
}

.team__body__section :deep(.check-box__label__text) {
  color: $color90Black;
  @include typography(md-1, headlines, 500);
}

.team__info {
  @include col;
  row-gap: 10px;
  width: 50%;
  margin-left: 30px;
}

.team__info__pill {
  align-self: start;
}

.team__name {
  @include typography(xl, headlines, 500);
  color: $colorSecondaryDark1;
  margin-bottom: 10px;
}

.team__pair {
  @include col;
  margin: 15px 30px 0 0;
  font-family: $fontFamilyDefault;
}

.team__key {
  @include typography(md);
  letter-spacing: 0.2px;
  color: $colorSecondaryLight;
  margin-bottom: 7px;
}

.team__value {
  @include typography(md-1, bold);
  color: $colorSecondaryLight;
}

.row--distributed {
  @include row--distributed;
}

.team__delete {
  margin-top: 30px;
  @include typography(md-1, headlines, 500);
}

.team__delete__title {
  @include typography(md-1, headlines, 500);
  letter-spacing: 0.5px;
  text-transform: uppercase;
  color: $colorPink;
  margin-bottom: 10px;
  padding: 0;

  &:hover {
    opacity: 0.7;
  }
  &:active {
    opacity: 0.5;
  }
}
</style>

<!-- eslint-disable vue-scoped-css/enforce-style-type -->
<style lang="scss">
.team__body__section {
  .radio__title {
    color: inherit
  }
}
</style>
