<template>
  <router-link
    v-if="step.to"
    class="dataset-create__step-item"
    :class="{ 'dataset-create__step-item--v2': isV2 }"
    active-class="dataset-create__step-item--active"
    :to="step.to"
  >
    <span class="dataset-create__step-item-index">{{ index + 1 }}</span>
    <span class="dataset-create__step-item-description">{{ step.name }}</span>
  </router-link>
  <div
    v-else
    :key="index"
    class="dataset-create__step-item"
  >
    <span class="dataset-create__step-item-index">{{ index + 1 }}</span>
    <span class="dataset-create__step-item-description">{{ step.name }}</span>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

export type Step = {
  name: string,
  to?: string
}

@Component({ name: 'dataset-create-step-item' })
export default class DatasetCreateStepItem extends Vue {
  @Prop({ required: true })
  index!: number

  @Prop({ required: false, type: Boolean, default: false })
  isV2?: boolean

  @Prop({ required: true })
  step!: Step
}
</script>

<style lang="scss" scoped>

.dataset-create__step-item {
  @include row--center;
  position: relative;
  cursor: pointer;

  .dataset-create__step-item-index {
    @include typography(lg-1, inter, bold);
  }

  &--v2.dataset-create__step-item--active {
    .dataset-create__step-item-index {
      background: $colorInteractivePrimaryDefault;
      border-color: $colorInteractivePrimaryDefault;
    }
  }
}

.dataset-create__step-item-index {
  @include row--center;
  width: 30px;
  height: 30px;
  border-radius: 15px;
  @include typography(lg-1, headlines, bold);
  color: $colorSecondaryLight;
  border: 2px solid $colorSecondaryLight;
  margin: 0 10px 0 0;
}

.dataset-create__step-item--active .dataset-create__step-item-index {
  background: $colorPrimaryLight;
  border: 2px solid $colorPrimaryLight;
  color: $colorWhite;
}

.dataset-create__step-item-description {
  @include typography(lg-1, headlines, bold);
  color: $colorSecondaryLight;
}

.dataset-create__step-item--active .dataset-create__step-item-description {
  color: $colorSecondaryDark1;
}
</style>
