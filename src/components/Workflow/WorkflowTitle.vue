<template>
  <div class="workflow-title">
    <div class="workflow-title__header">
      <h1 class="workflow-title__header__title">
        Workflows
      </h1>
      <custom-button
        color="primary"
        flair="rounded"
        :disabled="loading"
        tag="router-link"
        :to="route"
      >
        <template #prefix-icon>
          <plus-icon />
        </template>
        Create Workflow
      </custom-button>
    </div>
    <div
      class="workflow-title__filter"
    >
      <div class="workflow-title__search">
        <slot name="search" />
      </div>
      <div class="workflow-title__sort">
        <slot name="sort" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { RawLocation } from 'vue-router'

import { CustomButton, PlusIcon } from '@/components/Common/Button/V2'

@Component({
  name: 'workflow-title',
  components: { CustomButton, PlusIcon }
})
export default class WorkflowTitle extends Vue {
  route: RawLocation = { path: '/workflows/new-workflow' }

  @Prop({ default: false, type: Boolean })
  loading!: boolean
}
</script>

<style lang="scss" scoped>
.workflow-title {
  width: 100%;
  @include col--distributed;

  &__header {
    @include row--distributed--center;
    height: 40px;

    &__title {
      @include typographyRegularBody600;
      color: $colorContentDefault;
    }
  }

  &__filter {
    @include row;
  }
}
</style>
