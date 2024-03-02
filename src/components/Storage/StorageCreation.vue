<template>
  <div>
    <div
      class="creation__btn"
      :class="{ 'creation__btn--space': !isTargetPlan }"
    >
      <secondary-button
        :disabled="isDisabled"
        @click="show"
      >
        New Storage Integration
      </secondary-button>
      <upgrade-btn class="creation__upgrade-icon" />
    </div>

    <modal
      name="new-storage"
      translate="pop-out"
      width="35%"
      height="auto"
      :click-to-close="false"
    >
      <div class="modal__header">
        <p class="modal__header__title">
          New Storage Integration
        </p>
        <div
          class="modal__header__close"
          @click="close"
        >
          &#10005;
        </div>
      </div>
      <div
        v-loading="loading"
        class="modal__content"
      >
        <storage-provider-select
          v-model="provider"
          class="storage__field"
          :clearable="false"
          required
          label="Storage Provider"
        />
        <aws-storage-form
          v-if="provider===PROVIDER_TYPE.AWS"
          @canceled="close"
          @submitted="onSubmit"
        />
        <gcp-storage-form
          v-else-if="provider===PROVIDER_TYPE.GCP"
          @canceled="close"
          @submitted="onSubmit"
        />
        <azure-storage-form
          v-else-if="provider===PROVIDER_TYPE.Azure"
          @canceled="close"
          @submitted="onSubmit"
        />
        <minio-storage-form
          v-else-if="provider===PROVIDER_TYPE.Minio"
          @canceled="close"
          @submitted="onSubmit"
        />
      </div>
    </modal>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { State, Getter } from 'vuex-class'

import { UpgradeBtn } from '@/components/Common/UpgradeBtn'
import { resolvePlanForCredit, SubscriptionPlanName } from '@/components/Plans/Product/utils'
import AwsStorageForm from '@/components/Storage/Forms/AwsStorageForm.vue'
import AzureStorageForm from '@/components/Storage/Forms/AzureStorageForm.vue'
import GcpStorageForm from '@/components/Storage/Forms/GcpStorageForm.vue'
import MinioStorageForm from '@/components/Storage/Forms/MinioStorageForm.vue'
import StorageProviderSelect from '@/components/Storage/StorageProviderSelect.vue'
import { BillingInfoPayload, CustomerSubscriptionPayload } from '@/store/modules/billing/types'
import { StoragePayload, StorageProvider } from '@/store/types'
import { annotationCreditsBilledNextPeriod } from '@/utils/billing'

/**
 * A button that triggers a modal window for storage creation
 */
@Component({
  name: 'storage-creation',
  components: {
    AwsStorageForm,
    AzureStorageForm,
    GcpStorageForm,
    MinioStorageForm,
    StorageProviderSelect,
    UpgradeBtn
  }
})
export default class StorageCreation extends Vue {
  @State(state => state.billing.billingInfo)
  billingInfo!: BillingInfoPayload

  @Getter('storages', { namespace: 'storage' })
  storages!: StoragePayload[]

  PROVIDER_TYPE = StorageProvider

  provider: string = 'aws'

  get currentPlan (): SubscriptionPlanName {
    const { billingInfo } = this

    if (billingInfo.freemium) {
      return 'freemium'
    }
    const currentAmount = annotationCreditsBilledNextPeriod(billingInfo)
    return resolvePlanForCredit(currentAmount)
  }

  get subscription (): CustomerSubscriptionPayload {
    const { billingInfo: { customer_subscription: subscription } } = this
    if (!subscription) { throw new Error('Invalid customer subscription data') }
    return subscription
  }

  get isTargetPlan (): boolean {
    return this.currentPlan === 'enterprise'
  }

  loading: boolean = false

  show (): void {
    this.$modal.show('new-storage')
  }

  close (): void {
    this.$modal.hide('new-storage')
  }

  get isDisabled (): boolean {
    if (!this.subscription) {
      return true
    }
    return (
      this.subscription.external_storage_buckets <=
      this.subscription.external_storage_buckets_used
    )
  }

  async onSubmit (storage: StoragePayload) {
    this.loading = true

    const { error } = await this.$store.dispatch('storage/addStorage', {
      ...storage,
      provider: this.provider
    })

    if (error) {
      this.loading = false
      if (error.isValidationError && !error.message) {
        return this.$store.dispatch('toast/warning', { content: 'Validation error' })
      } else {
        return this.$store.dispatch('toast/warning', { content: error.message })
      }
    }
    await this.$store.dispatch('billing/loadBillingInfo')
    this.close()

    this.loading = false
  }
}
</script>

<style lang="scss" scoped>
.creation__btn {
  display: grid;
  align-items: center;

  button {
    grid-column: 1;
    grid-row: 1;
  }
}

.creation__btn--space {
  button {
    padding-right: 3rem;
  }
}

.creation__upgrade-icon {
  justify-self: end;
  margin-right: 10px;
  grid-column: 1;
  grid-row: 1;
}

.storage {
  &__field {
    margin-bottom: $defaultSpace;
  }
}
</style>
