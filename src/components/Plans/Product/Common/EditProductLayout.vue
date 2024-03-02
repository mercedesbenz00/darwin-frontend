<template>
  <div
    class="edit-product"
    :class="{ 'edit-product--no-title': !showTitle }"
  >
    <h2
      v-if="showTitle"
      class="edit-product__title"
    >
      <slot name="title" />
      <circle-spinner
        v-if="disabled"
        aria-label="Loading…"
        class="class-selection__loading-indicator"
        :dark="true"
        :width="16"
        :height="16"
      />
    </h2>
    <div class="edit-product__body">
      <slot name="current" />
      <slot name="new" />
      <div
        v-if="$slots.issues"
        class="edit-product__body__issues"
      >
        <slot name="issues" />
      </div>
      <slot name="extra" />
    </div>
    <div class="edit-product__footer">
      <secondary-button
        class="edit-product__footer__button edit-product__footer__button--cancel"
        :disabled="disabled"
        type="button"
        @click="$emit('cancel')"
      >
        Cancel
      </secondary-button>
      <positive-button
        class="edit-product__footer__button edit-product__footer__button--confirm"
        :disabled="disabled || confirmDisabled"
        type="button"
        @click="$emit('confirm')"
      >
        <slot name="confirm">
          Confirm
        </slot>
        <circle-spinner
          v-if="disabled && !showTitle"
          aria-label="Loading…"
          class="class-selection__loading-indicator"
          :dark="true"
          :width="16"
          :height="16"
        />
      </positive-button>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'

import { CircleSpinner } from '@/components/Common/LoadingIndicators'

@Component({ name: 'edit-product-layout', components: { CircleSpinner } })
export default class EditProductLayout extends Vue {
  @Prop({ required: false, default: false, type: Boolean })
  disabled!: boolean

  @Prop({ required: false, default: false, type: Boolean })
  confirmDisabled!: boolean

  get showTitle () {
    return !!this.$slots.title
  }
}
</script>

<style lang="scss" scoped>
.edit-product {
  display: grid;
  grid-template-rows: auto 1fr auto;
  grid-gap: 2rem;
  padding: 2rem;
}

.edit-product--no-title {
  grid-template-rows: 1fr auto;
}

.edit-product__title {
  color: $colorBlack;
  @include typography(xl, headlines, bold);

  display: grid;
  grid-auto-flow: column;
  grid-gap: 1rem;
  align-items: center;
  justify-content: space-between;

  :deep(.sk-fading-circle) {
    margin: 0;
  }
}

.edit-product__body {
  display: grid;
  grid-template-columns: 130px auto;
  justify-items: left;

  &__issues {
    grid-column: 1 / 3;
    color: $colorPink;
    font-weight: bold;
  }

  > :last-child {
    grid-column: 1 / 3;
  }
}

.edit-product__footer {
  display: grid;
  grid-template-columns: 1fr 1fr;
  justify-items: left;
}

.edit-product__footer__button {
  width: calc(100% - 15px);
  @include row--center;
  @include typography(md-1, default, bold);

  &:first-child {
    justify-self: left;
  }

  &:last-child {
    justify-self: right;
  }
}
</style>
