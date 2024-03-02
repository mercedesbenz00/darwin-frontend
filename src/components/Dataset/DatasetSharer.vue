<template>
  <div class="dataset-sharer">
    <v-popover
      placement="bottom-left"
      trigger="manual"
      popover-class="tooltip--white popover--sharer"
      :open="modalVisible"
    >
      <div
        :title="shareInfo"
      >
        <positive-button
          class="dataset-sharer__share-button"
          :disabled="disabled"
          @click.stop="openModal"
        >
          Share Dataset
        </positive-button>
      </div>
      <template #popover>
        <div
          v-click-outside="closeModal"
          class="dataset-sharer__modal"
        >
          <h2 class="dataset-sharer__modal__title">
            Share Dataset
          </h2>
          <button
            class="dataset-sharer__modal__share-toggle"
            :disabled="disabledDatasetSharing"
            @click.prevent="$emit('toggle-share')"
          >
            <div class="dataset-sharer__modal__share-toggle__label">
              Open Dataset
            </div>
            <div
              class="dataset-sharer__modal__share-toggle__control"
              :class="{
                'dataset-sharer__modal__share-toggle__control--active': dataset.public
              }"
            />
          </button>
          <div
            class="dataset-sharer__modal__text"
          >
            Open datasets can be accessed, exported, or forked by anyone on the
            internet, but cannot be edited. They also do not incur storage fees.
          </div>
          <div
            v-if="dataset.public"
            class="dataset-sharer__modal__share-url"
          >
            <a
              :href="shareUrl"
              target="_blank"
            >{{ shareUrl }}</a>
          </div>
        </div>
      </template>
    </v-popover>
  </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { State } from 'vuex-class'

import { BillingInfoPayload, StripeSubscriptionStatus } from '@/store/modules/billing/types'

@Component({ name: 'dataset-sharer' })
export default class DatasetSharer extends Vue {
  modalVisible: boolean = false;

  @Prop({ required: true })
  dataset!: { public: boolean, slug: string }

  @Prop({ required: true })
  team!: { slug: string }

  @Prop({ default: false })
  disabled!: boolean

  @State(state => state.billing.billingInfo)
  billingInfo!: BillingInfoPayload

  get shareUrl (): string {
    return `${window.location.origin}/${this.team.slug}/${this.dataset.slug}`
  }

  get shareInfo (): string {
    if (this.disabled) {
      return 'Your team disabled dataset sharing'
    } else {
      return 'Share this dataset'
    }
  }

  get disabledDatasetSharing (): boolean {
    const { billingInfo, isTrialing } = this
    return !isTrialing && billingInfo.freemium
  }

  get isTrialing (): boolean {
    const { billingInfo } = this
    return billingInfo.customer.stripe_subscription_status === StripeSubscriptionStatus.Trialing
  }

  openModal () {
    this.modalVisible = true
  }

  closeModal () {
    this.modalVisible = false
  }
}
</script>

<style lang="scss" scoped>
.dataset-sharer {
  overflow: visible;
  position: relative;
}

.dataset-sharer__share-button {
  width: 100%;
  height: 100%;
}

.dataset-sharer__modal {
  width: 322px;
  padding: 30px;
}

.dataset-sharer__modal__title {
  color: $colorSecondaryDark;
  @include typography(xl-2, default, bold);
  margin-bottom: 20px;
}

.dataset-sharer__modal__share-toggle {
  @include row--distributed--center;
  background: $colorWhite;
  width: 100%;
  margin-bottom: 20px;
  padding: 0;
}

.dataset-sharer__modal__share-toggle__label {
  @include typography(lg, default, bold);
  color: $colorSecondaryDark;
}

.dataset-sharer__modal__share-toggle__control {
  transition: .4s;
  width: 48px;
  height: 26px;
  background: $colorSecondaryLight3;
  border-radius: 12px;
  border: 1px solid $colorSecondaryLight2;

  position: relative;

  &:after {
    content: "";
    position: absolute;
    top: 3px;
    left: 3px;
    right: auto;
    height: 19px;
    width: 19px;
    border-radius: 50%;
    background: $colorSecondaryLight;
    box-shadow: 0px 4px 4px rgba(145, 169, 192, 0.3);
  }

  &--active {
    background: $colorPrimaryLight1;

    &:after {
      right: 3px;
      left: auto;
    }
  }
}

.dataset-sharer__modal__text {
  @include typography(md-1, default);
  color: $colorSecondaryLight;
  margin-bottom: 20px;
}

.dataset-sharer__modal__share-url {
  @include typography(md-1, default, bold);
  border: 1px solid $colorSecondaryLight1;
  background: $colorSecondaryLight4;
  color: $colorPrimaryLight1;
  padding: 10px;
  overflow: hidden;
  white-space: nowrap;

  a {
    color: $colorPrimaryLight1;
  }
}
</style>

<!-- eslint-disable vue-scoped-css/enforce-style-type -->
<style lang="scss">
.popover--sharer {
  border-radius: $border-radius-default;

  .tooltip-inner {
    border-radius: $border-radius-default;
    max-width: none;
    overflow: hidden;
    padding: 1.5px;
    box-shadow: 0 5px 20px 0 rgba(145,169,192,.3), 0 10px 10px -5px rgba(145,169,192,.3);
  }
}
</style>
