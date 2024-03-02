<template>
  <div
    class="dataset-create__step-items"
    :class="{'dataset-create__step-items-v2': !showAnnotationStep}"
  >
    <dataset-create-step-item
      v-for="(step, index) in steps"
      :is-v2="!showAnnotationStep"
      :key="index"
      :index="index"
      :step="step"
    />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { Getter } from 'vuex-class'

import {
  DatasetPayload
} from '@/store/types'

import DatasetCreateStepItem from './DatasetCreateStepItem.vue'

@Component({
  name: 'dataset-create-step-items',
  components: { DatasetCreateStepItem }
})
export default class DatasetCreateSteps extends Vue {
  @Prop({})
  datasetId?: number

  @Getter('findById', { namespace: 'dataset' })
  datasetById!: (id: number) => DatasetPayload

  get dataset (): DatasetPayload | null {
    return this.datasetId ? this.datasetById(this.datasetId) : null
  }

  get showAnnotationStep (): boolean {
    return !this.$featureEnabled('DARWIN_V2_ENABLED') ||
      this.dataset?.version === 1
  }

  get steps (): { to?: string | undefined; name: string; }[] {
    const { datasetId } = this
    // if dataset is not created - it should depend on the feature flag,
    // if the version field is there then the flag should be ignored.

    return [
      {
        name: 'Title',
        // cannot go back to step one after dataset is created
        ...(!datasetId && { to: '/datasets/create' })
      },
      {
        name: 'Data',
        // can only be on step 2 once dataset is created, but no dataset yet
        ...(datasetId && { to: `/datasets/create/${datasetId}/data` })
      },
      // once both dataset and dataset are created, step 3 and 4 are accessible
      {
        name: 'Classes',
        ...(datasetId && { to: `/datasets/create/${datasetId}/instructions` })
      },
      {
        name: this.showAnnotationStep ? 'Annotators' : 'Workflows',
        ...(datasetId && {
          to: `/datasets/create/${datasetId}/${
            this.showAnnotationStep
              ? 'annotators'
              : 'workflow'
          }`
        })

      }
    ]
  }
}
</script>

<style lang="scss" scoped>
.dataset-create__step-items {
  background: transparent;
  @include row--distributed;
  padding: 15px 50px;

  &.dataset-create__step-items-v2 {
    :deep(.dataset-create__step-item-description) {
      @include typography(lg-1, inter);
    }
  }
}
</style>
