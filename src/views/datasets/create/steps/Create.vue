<template>
  <div
    class="dataset-create__box dataset-create__box--title"
    :class="{ 'dataset-create__box--v2': isV2 }"
  >
    <div class="dataset-create__box-left">
      <img
        :src="step.img"
        class="dataset-create__box__step-image"
      >
      <div class="dataset-create__box__step-writings">
        <div class="dataset-create__box__step-title">
          {{ step.title }}
        </div>
        <div class="dataset-create__box__step-description">
          {{ step.description }}
        </div>
      </div>
    </div>
    <div class="dataset-create__box-right">
      <form
        class="dataset-title"
        @submit.prevent="createDataset"
      >
        <label class="dataset-title__title">Type in a name for this dataset</label>
        <div class="dataset-title__inputs">
          <input-field-v2
            v-if="isV2"
            v-model="name"
            type="text"
            name="name"
            :error="v2NameError"
            :value="name"
            required="required"
            auto-focus
          />
          <input-field
            v-else
            ref="name"
            v-model="name"
            type="text"
            name="name"
            :value="name"
            required="required"
            auto-focus
          />
        </div>
        <div class="dataset-title__buttons">
          <custom-button
            v-if="isV2"
            size="large"
            flair="rounded"
            color="primary"
            class="dataset-title__continue"
            :disabled="disabled"
          >
            Continue
          </custom-button>
          <positive-button
            v-else
            class="dataset-title__continue"
            :disabled="disabled"
          >
            Continue
          </positive-button>
        </div>
      </form>
    </div>
  </div>
</template>

<script lang="ts">
import isEmpty from 'validator/lib/isEmpty'
import { Component, Vue } from 'vue-property-decorator'
import { Route } from 'vue-router'
import { Getter, State } from 'vuex-class'

import { CustomButton } from '@/components/Common/Button/V2'
import InputField from '@/components/Common/InputField/V1/InputField.vue'
import InputFieldV2 from '@/components/Common/InputField/V2/InputField.vue'
import BreadCrumbInitializer, { BreadCrumb } from '@/mixins/BreadCrumbInitializer'
import { BillingInfoPayload, StripeSubscriptionStatus } from '@/store/modules/billing/types'
import { UploadFile } from '@/store/modules/datasetUpload/types'

@Component({
  name: 'Create',
  components: { InputField, CustomButton, InputFieldV2 },
  mixins: [BreadCrumbInitializer]
})
export default class Create extends Vue {
  @State(state => state.billing.billingInfo)
  billingInfo!: BillingInfoPayload

  readonly breadCrumbs: BreadCrumb[] = [
    { to: '/datasets', name: 'Datasets' },
    { to: '/datasets/create', name: 'Dataset Creation' }
  ]

  readonly step = {
    img: '/static/imgs/dataset-step1.png',
    title: 'Create a New Dataset',
    description: [
      'Datasets represent your machine learning projects.',
      'You can add images and annotators to them, and define classes and labeling workflows.',
      'Datasets are independent of one-another, and accessible by any User or Admin in your team.'
    ].join(' ')
  }

  name: string = ''
  v2NameError?: string | null = null

  $refs!: Vue['$refs'] & {
    name?: InputField
  }

  get isV2 (): boolean {
    return this.$featureEnabled('DARWIN_V2_ENABLED')
  }

  get disabled (): boolean {
    return isEmpty(this.name)
  }

  get isTrialing (): boolean {
    const { billingInfo } = this
    return billingInfo.customer.stripe_subscription_status === StripeSubscriptionStatus.Trialing
  }

  validateForm (): { name?: string } {
    const errors: { name?: string } = {}

    if (isEmpty(this.name)) {
      errors.name = 'Dataset Title cannot be empty!'
    }

    return errors
  }

  @Getter('unfinishedFiles', { namespace: 'datasetUpload' })
  unfinishedFiles!: UploadFile[]

  beforeRouteEnter (to: Route, from: Route, next: Function) {
    return next((vm: Create) => {
      if (vm.unfinishedFiles.length > 0) {
        const content = [
          'A different dataset is still uploading.',
          'Please wait for the upload process to complete before starting another one.'
        ].join(' ')
        vm.$store.dispatch('toast/warning', { content })
        return next('/datasets')
      } else {
        vm.$store.commit('datasetUpload/STOP_UPLOAD')
        return next()
      }
    })
  }

  async createDataset () {
    this.v2NameError = null
    const { billingInfo, isTrialing } = this
    const errors = this.validateForm()

    if (Object.keys(errors).length > 0) {
      this.$refs.name?.setError(errors.name)
      this.v2NameError = errors.name

      this.$ga.event('create_dataset', 'continue_step_1', 'failure_form_invalid')
      return
    }

    const { data, error } = await this.$store.dispatch('dataset/createDataset',
      { name: this.name, isPublic: (!isTrialing && billingInfo.freemium) || false })

    if (error) {
      this.$refs.name?.setError(error.name)
      this.v2NameError = error.name
      this.$ga.event('create_dataset', 'continue_step_1', 'failure_backend_error')
      return
    }

    this.$ga.event('create_dataset', 'continue_step_1', 'success')
    this.$router.push({ name: 'DatasetCreationDataStep', params: { datasetId: data.id } })
  }
}
</script>

<style lang="scss" scoped>
.dataset-create__box {
  &--v2 {
    background: $colorNeutralsWhite;
    font-family: $fontFamilyInter;

    .dataset-title__title {
      @include typography(xl, inter, bold);
    }
  }

  &--title {
    @include row;
  }
}

.dataset-title {
  @include col--center;
  width: calc(100% - 160px);
}

.dataset-title__inputs {
  @include row--center;
  width: 100%;
  padding: 0;
  margin-bottom: 50px;
}

.dataset-title__title {
  width: 100%;
  @include typography(xl, default, bold);
  line-height: 26px;
  margin-bottom: 25px;
  color: $colorSecondaryDark;
}

.dataset-title__buttons {
  @include row;
  justify-content: flex-end;
  width: 100%;
  padding: 0;
}

.dataset-title__continue {
  width: 195px;
  @include respondTo(lg) {
    @include paddingLR(0px !important);
  }
}
</style>
