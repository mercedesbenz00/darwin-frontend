<template>
  <div class="numeric-input">
    <label class="numeric-input__label">{{ label }}</label>
    <div class="numeric-input__controls">
      <input
        class="numeric-input__controls__field"
        type="text"
        :value="unsanitizedValue"
        @change="onChange"
      >
      <div class="numeric-input__controls__buttons">
        <button
          class="numeric-input__controls__buttons__up"
          @click="increment"
        >
          <increment-icon />
        </button>
        <button
          class="numeric-input__controls__buttons__down"
          @click="decrement"
        >
          <decrement-icon />
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'

import DecrementIcon from './assets/decrement.svg?inline'
import IncrementIcon from './assets/increment.svg?inline'

@Component({ name: 'numeric-input', components: { DecrementIcon, IncrementIcon } })
export default class NumericInput extends Vue {
  @Prop({ required: true, type: String })
  label!: string

  /**
   * Value given to us by the  parent component, used as initial value for the
   * input.
   */
  @Prop({ required: true, type: Number })
  value!: number

  @Prop({ required: false, default: 1, type: Number })
  step!: number

  @Prop({ required: false, type: Number })
  min?: number

  @Prop({ required: false, type: Number })
  max?: number

  /**
   * This value is the current value of the input field, after min/max but
   * before any step checks are applied.
   *
   * These two fields are needed to cover an edge case. If we were to use
   * only sanitized value, then the binding to the input field would not trigger
   * a recompute when the user types in something that, rounded to the nearest
   * step, results in no change to the sanitizedValue.
   *
   * One field
   *
   * - start at 1000, step 100, type in 1003
   * - sanitized value rounded to nearest step of 1000
   * - no change emited to parent, no recompute on child input,
   * -> input stays at 1003, even though internal value is 1000
   *
   * Two fields
   *
   * - start at 1000, step 100, type in 1003.
   * - unsanitized value set to 1003
   * - sanitized value computed and set to 1000
   * - unsanitized value now again set to 1000
   * -> input field changes to 1000
   */
  unsanitizedValue: number = 0
  /**
   * This is the final sanitized value of the input field, after both the
   * min/max and step constraints are applied.
   */
  sanitizedValue: number = 0

  sanitized: boolean = true

  mounted () {
    this.onValue()
  }

  @Watch('value')
  onValue () {
    this.unsanitizedValue = this.value
    this.sanitizedValue = this.value
  }

  /**
   * Handles change event of the input field.
   *
   * Immeditately applies min max constraints and sets new unsanitizedValue.
   */
  onChange (e: KeyboardEvent) {
    const value = parseInt((e.currentTarget as HTMLInputElement).value)
    const { min, max } = this

    if (isNaN(value)) { return }
    if (min && value < min) {
      this.unsanitizedValue = min
    } else if (max && value > max) {
      this.unsanitizedValue = max
    } else {
      this.unsanitizedValue = value
    }

    // Notify parent that the value needs to be sanitized
    // based on given constraints
    this.$emit('dirty')
  }

  /**
   * Directly increases unsanitizedValue by step, while respecting min/max
   * constraints.
   */
  increment () {
    const { sanitizedValue, min, max, step } = this
    const newValue = sanitizedValue + step
    if (max !== undefined && newValue > max) {
      this.unsanitizedValue = max
    } else if (min !== undefined && newValue < min) {
      this.unsanitizedValue = min
    } else {
      this.unsanitizedValue = newValue
    }
  }

  /**
   * Directly reduces unsanitizedValue by step, while respecting min/max
   * constraints.
   */
  decrement () {
    const { unsanitizedValue, min, step } = this
    const newValue = min !== undefined
      ? Math.max(unsanitizedValue - step, min)
      : unsanitizedValue - step
    this.unsanitizedValue = newValue
  }

  /**
   * Handles change of unsanitizedValue.
   *
   * Applies step constraints and computes sanitizedValue.
   * Emits change event to parent if necessary.
   */
  @Watch('unsanitizedValue')
  sanitizeValue () {
    const { sanitizedValue: previousValue, unsanitizedValue, step } = this
    this.sanitizedValue = Math.round(unsanitizedValue / step) * step
    if (this.sanitizedValue !== previousValue) { this.$emit('change', this.sanitizedValue) }
    this.unsanitizedValue = this.sanitizedValue

    // Notify parent that the value is now sanitized
    if (previousValue !== this.sanitizedValue) { this.$emit('clean') }
  }
}
</script>

<style lang="scss" scoped>
.numeric-input {
  @include col--center;
}

.numeric-input__label {
  text-align: center;
  padding-bottom: 5px;
}

.numeric-input__controls {
  @include row;
  align-items: center;
}

.numeric-input__controls__field {
  width: 35px;
  height: 60px;
  text-align: center;
  vertical-align: middle;
  border: 1px solid $colorSecondaryLight1;
  border-radius: 3px 0 0 3px;

  @include typography(lg-1, default, bold);

  box-shadow: inset 0px 2px 4px rgba(145, 169, 192, 0.3), inset 0px 0px 12px rgba(145, 169, 192, 0.2);
}

.numeric-input__controls__buttons {
  @include col;
  width: 40%;
  justify-content: space-evenly;

  &__up,
  &__down {
    padding: 0;
    height: 30px;
    width: 30px;
    background: none;
    @include col--center;
    justify-items: center;
    background: $colorSecondaryLight1;
    border-radius: 0;

    svg {
      height: 90%;
      path {
        fill: $colorSecondaryLight;
      }
    }
  }

  &__up {
    height: 31px;
    border-bottom: 2px solid $colorSecondaryLight;
    border-top-right-radius: 3px;
  }

  &__down {
    height: 29px;
    border-bottom-right-radius: 3px;
  }
}
</style>
