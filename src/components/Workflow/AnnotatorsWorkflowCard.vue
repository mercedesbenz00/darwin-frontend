<template>
  <div class="annotators-workflow-card">
    <div class="annotators-workflow-card__upside">
      <thumbnails :data="thumbnails" />
    </div>
    <div class="annotators-workflow-card__details">
      <div class="annotators-workflow-card__details__row">
        <header-3
          v-tooltip="{
            content: name,
            placement: 'top',
            delay: { show: 300 },
            classes: 'tooltip--workflow-card'
          }"
          class="annotators-workflow-card__details__name"
        >
          {{ name }}
        </header-3>
      </div>
    </div>
    <div class="annotators-workflow-card__actions">
      <custom-button
        variant="outline"
        flair="soft"
        style="width: 100%;"
        :class="'annotators-workflow-card__action'"
        @click="openInstructions"
        v-if="dataset"
      >
        <span class="annotators-workflow-card__actions__content">
          <span class="label">
            Read Instructions
          </span>
        </span>
      </custom-button>
      <custom-button
        variant="default"
        tag="router-link"
        flair="soft"
        style="width: 100%;"
        :to="workviewRoute"
        :class="'annotators-workflow-card__action'"
        v-if="assignedItems > 0"
      >
        <span class="annotators-workflow-card__actions__content">
          <span class="label">
            {{ assignedItems }} Assigned to you
          </span>
        </span>
      </custom-button>
      <custom-button
        variant="outline"
        flair="soft"
        style="width: 100%;"
        :class="'annotators-workflow-card__action'"
        @click="$emit('request-work', workflow)"
        v-else
      >
        <span class="annotators-workflow-card__actions__content">
          <slot name="prefix-icon">&nbsp;&plus;&nbsp;</slot>
          <span class="label">
            Request More
          </span>
        </span>
      </custom-button>
    </div>
    <modal
      class="modal__instructions"
      :name="instructionsModal"
      :adaptive="true"
      :height="'80%'"
      :max-height="800"
      :min-height="400"
      v-if="dataset"
    >
      <div class="modal__header">
        <button
          class="modal__close-button"
          aria-label="close"
          @click="closeInstructions"
        />
        <strong>{{ dataset.name }}</strong>
        <p>Annotation instructions</p>
      </div>
      <div class="instructions-scroll-container">
        <instructions
          :annotation-classes="datasetClasses"
          :dataset="dataset"
          :text="instructions"
          in-modal
        />
      </div>
    </modal>
  </div>
</template>

<script lang = "ts">
import { truncate } from 'lodash'
import { Component, Prop, Vue } from 'vue-property-decorator'
import { State } from 'vuex-class'

import { CustomButton } from '@/components/Common/Button/V2'
import Header3 from '@/components/Common/Header3.vue'
import Thumbnails from '@/components/Common/Thumbnails/Thumbnails.vue'
import Instructions from '@/components/WorkView/Instructions/Instructions.vue'
import {
  AnnotationClassPayload,
  RootState,
  V2WorkflowDatasetPayload,
  V2WorkflowPayload
} from '@/store/types'
import { getDatasetClasses } from '@/utils'

@Component({
  name: 'annotators-workflow-card',
  components: {
    CustomButton,
    Header3,
    Instructions,
    Thumbnails
  }
})
export default class AnnotatorsWorkflowCard extends Vue {
  @State((state: RootState) => state.aclass.classes)
  annotationClasses!: AnnotationClassPayload[]

  @Prop({ required: true })
  workflow!: V2WorkflowPayload

  get assignedItems (): number {
    return this.workflow.assigned_items || 0
  }

  get dataset (): V2WorkflowDatasetPayload | undefined {
    return this.workflow.dataset
  }

  get datasetClasses (): AnnotationClassPayload[] {
    if (!this.dataset) { return [] }

    return getDatasetClasses(this.annotationClasses, this.dataset.id)
  }

  get instructions (): string {
    return this.dataset?.instructions || ''
  }

  get instructionsModal (): string {
    return `instructions-${this.workflow.id}`
  }

  get name (): string {
    return truncate(this.workflow.name, { length: 64 })
  }

  get thumbnails (): string[] {
    return this.workflow.thumbnails
  }

  get workviewRoute (): string {
    if (!this.dataset) { return '#' }

    return `/workview?dataset=${this.dataset?.id}`
  }

  openInstructions (): void {
    if (!this.dataset) {
      this.$store.dispatch('toast/notify', {
        content: `There is no dataset in workflow ${this.name} to get instructions from.`
      })
      return
    }

    this.$store.dispatch('ui/putBackSidebar')
    this.$modal.show(this.instructionsModal)
  }

  closeInstructions (): void {
    this.$store.dispatch('ui/bringFrontSidebar')
    this.$modal.hide(this.instructionsModal)
  }
}
</script>

<!-- eslint-disable-next-line vue-scoped-css/enforce-style-type -->
<style lang="scss">
.tooltip--workflow-card {
  &[x-placement^="top"] {
    margin-bottom: 7px;
  }
}
</style>

<style lang="scss" scoped>
.annotators-workflow-card {
  @include col;
  display: inline-flex;
  flex: 1 1 auto;
  min-width: 320px !important;
  padding: 10px;
  background: $colorWhite;
  border-radius: 12px;
  border: 1px solid $colorNeutralsLight300;
  box-shadow: $shadowLightXS;
  position: relative;

  .annotators-workflow-card__upside {
    width: 100%;
    height: 100px;
    border-radius: 12px 12px 0 0;
    position: relative;
  }

  .annotators-workflow-card__details {
    position: relative;
    @include typography(md, inter);
    align-items: center;
    padding: 8px 0 0;
    line-height: 20px;

    .annotators-workflow-card__details__row {
      position: relative;
      @include row--distributed;
    }

    &__name {
      word-break: break-all;
      text-decoration: none;
      align-items: center;
      text-align: justify;
      font-weight: 500 !important;
      color: $colorContentDefault;
    }
  }

  &__actions {
    padding: 8px 0 0;
    @include typography(md, inter);
    line-height: 20px;

    &__content {
      @include row--center;
    }
  }

  &__action:not(:last-child) {
    margin-bottom: 8px;
  }
}
</style>
