<template>
  <div class="wizard">
    <div
      v-for="(stepName, index) of steps"
      :ref="refName(index)"
      :key="stepName"
      class="wizard__step"
      role="button"
      :class="{
        'wizard__step--current': step === index,
        'wizard__step--unvisited': index > maxStep
      }"
      tabindex="-1"
      @focus="$emit('update:step', index)"
    >
      <slot
        name="step"
        :on-continue="() => onContinue(index)"
        :index="index"
      />
      <!-- ensures the UI rendered in the slot is non-interactive while not current step -->
      <div
        v-if="step !== index"
        class="wizard__step__overlay"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch, Prop } from 'vue-property-decorator'

/**
 * Reusable component used for rendering a typeflow-like wizard interface
 *
 * Provides a scoped slot, to render each given step. The step index and the
 * "onContinue" callback are given to the step.
 *
 * "onContinue" can be used if the rendred step UI has as element which is
 * supposed to trigger the next step.
 *
 * Emits "onStepChange(stepIndex, slotWrapperScrollOffste)" when the step changes.
 */
@Component({ name: 'wizard' })
export default class Wizard extends Vue {
  /**
   * The current step of the wizard flow
   */
  @Prop({ required: true, type: Number })
  step!: number

  /**
   * Maximum step wizard was in since mount.
   *
   * Previoulsy visited non-current steps are rendered with 0.3 opacity
   * Future steps (never before visted) are not rendered at all
   */
  maxStep: number = 0

  /**
   * Named steps the wizard must go through
   */
  @Prop({ required: true, type: Array as () => string[] })
  steps!: string[]

  /**
   * Increments step, but only if event was triggered from current step
   */
  onContinue (from: number): void {
    const { step } = this
    if (step !== from) { return }
    this.$emit('update:step', step + 1)
  }

  /**
   * Computes name of the ref slot, so we can reuse it in both template and logic
   */
  refName (index: number): string {
    return `step_${index}`
  }

  /**
   * When step changes, we need to set maxStep, if necessary.
   * We also emit "step" event, with the currentStep index and the scroll offset
   * of the slot container for the current step.
   *
   * The scroll offset allows the parent component to dynamically scroll to the
   * step element, relative to the scrolling container used by the parent.
   */
  @Watch('step')
  onStep () {
    const { step, maxStep } = this
    if (step > maxStep) { this.maxStep = step }
    this.$nextTick(() =>
      this.$emit('step', step, this.getCurrentStepElOffsetTop())
    )
  }

  /**
   * Returns offsetTop of the container element for the current step
   */
  getCurrentStepElOffsetTop (): number {
    const { step } = this
    const refName = this.refName(step)
    // since refs for container elements are rendered in a v-for, each is
    // defined as an array
    const refs = this.$refs[refName] as HTMLDivElement[]
    const ref = refs[0]

    return ref ? ref.offsetTop : 0
  }
}
</script>

<style lang="scss" scoped>
.wizard {
  display: grid;
  grid-auto-flow: row;
  row-gap: 40px;
}

.wizard__step {
  transition: opacity .2s ease;
  opacity: 0.3;
}

.wizard__step:focus {
  outline: inherit;
}

.wizard__step.wizard__step--current {
  opacity: 1.0;
}
.wizard__step.wizard__step.wizard__step--unvisited {
  display: none;
}

.wizard__step {
  // element will display the slot and maybe the overlay (if not current step)
  // these rules ensure the overlay renders the slot non-interactive
  // key is giving both elements a z-index
  display: grid;
  > * { grid-area: 1 / 1 / 1 / 1; }
  > :first-child { z-index: 1 }
  .wizard__step__overlay { z-index: 2; }
}
</style>
