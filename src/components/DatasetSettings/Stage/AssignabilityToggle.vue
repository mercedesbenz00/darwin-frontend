<template>
  <div class="assignability">
    <rounded-toggle-button
      class="assignability__button"
      :selected="anyone"
      @toggle="toggleAnyone"
    >
      <div class="assignability__button__icon">
        <img src="/static/imgs/image-status/all.svg">
      </div>
      <span class="assignability__button__label">Anyone</span>
    </rounded-toggle-button>
    <rounded-toggle-button
      class="assignability__button"
      :selected="anyUser"
      @toggle="toggleAnyUser"
    >
      <div class="assignability__button__icon">
        <img src="/static/imgs/image-status/all.svg">
      </div>
      <span class="assignability__button__label">Any user</span>
    </rounded-toggle-button>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'

import RoundedToggleButton from '@/components/Common/Button/V1/RoundedToggleButton.vue'
import { AnnotateStageTemplatePayload } from '@/store/types'

type AssignableTo = AnnotateStageTemplatePayload['metadata']['assignable_to']

@Component({ name: 'assignability-toggle', components: { RoundedToggleButton } })
export default class AssignabilityToggle extends Vue {
  @Prop({ required: true, type: String as () => AssignableTo })
  assignableTo!: AssignableTo

  get anyone (): boolean {
    return this.assignableTo === 'anyone'
  }

  get anyUser (): boolean {
    return this.assignableTo === 'any_user'
  }

  toggleAnyone (): void {
    const { assignableTo } = this
    this.$emit('change', assignableTo === 'anyone' ? 'manual' : 'anyone')
  }

  toggleAnyUser (): void {
    const { assignableTo } = this
    this.$emit('change', assignableTo === 'any_user' ? 'manual' : 'any_user')
  }

  emitChange (value: AssignableTo): void {
    /**
     * Returns new value of stageTemplate.metadata.assignable_to, based on
     * current value and user interaction.
     *
     * @event change
     * @type {AssignableTo}
     */
    this.$emit('change', value)
  }
}
</script>

<style lang="scss" scoped>
.assignability__button {
  width: 100%;
  display: grid;
  grid-template-columns: 20px 1fr;
  column-gap: 8px;

  align-items: center;
  padding: 2px 3px;
}

.assignability__button__icon {
  width: 100%;
  height: 100%;
  border-radius: 50%;

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
}

.assignability__button__label {
  @include typography(md);
  color: $colorSecondaryDark;
  text-align: left;
}
</style>
