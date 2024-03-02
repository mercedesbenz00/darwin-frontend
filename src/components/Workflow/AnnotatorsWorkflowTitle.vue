<template>
  <div class="annotators-workflow-title">
    <div class="annotators-workflow-title__header">
      <h1 class="annotators-workflow-title__header__title">
        {{ title }}
      </h1>
    </div>
    <div class="annotators-workflow-title__filter">
      <div class="annotators-workflow-title__search">
        <slot name="search" />
      </div>
      <div class="annotators-workflow-title__sort">
        <slot name="sort" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import { pluralize } from '@/utils'

@Component({
  name: 'annotators-workflow-title'
})
export default class AnnotatorsWorkflowTitle extends Vue {
  @Prop({ required: true, type: Boolean })
  loading!: boolean

  @Prop({ required: false, type: Number, default: 0 })
  count!: number

  get title (): string {
    if (this.loading) { return 'Loading Workflows...' }
    if (this.count === 0) { return 'You have no assigned Workflows' }

    const pluralized = pluralize(this.count, 'assigned Workflow', 'assigned Workflows')

    return `You have ${pluralized}`
  }
}
</script>

<style lang="scss" scoped>
.annotators-workflow-title {
  width: 100%;
  @include col--distributed;
  &__header {
    @include row--distributed--center;
    height: 40px;
    margin-bottom: 12px;
    &__title {
      @include typography(xl-2, inter, 500);
      color: $colorContentDefault;
    }
  }
  &__filter {
    @include row;
  }
}
</style>
