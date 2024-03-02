<template>
  <div class="usage-limiter">
    <check-box
      class="usage-limiter__checkbox"
      :value="isLimited"
      :disabled="disabled"
      label="Limit usage"
      @input="toggleLimit"
    />
    <input-field-small
      v-model="newLimit"
      class="usage-limiter__input"
      theme="light"
      :disabled="!isLimited || disabled"
    />
    <span
      class="usage-limiter__input-width"
      aria-hidden="true"
    >{{ newLimit }}</span>
    <mini-secondary-light-button
      :disabled="!isLimited || disabled"
      @click="confirmLimit"
    >
      Save
    </mini-secondary-light-button>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'

import MiniSecondaryLightButton from '@/components/Common/Button/V1/MiniSecondaryLightButton.vue'
import CheckBox from '@/components/Common/CheckBox/V1/CheckBox.vue'
import InputFieldSmall from '@/components/Common/InputFieldSmall.vue'

@Component({
  name: 'usage-limiter',
  components: { CheckBox, InputFieldSmall, MiniSecondaryLightButton }
})
export default class UsageLimiter extends Vue {
  /**
   * The limit of the subject this component is being rendered for.
   */
  @Prop({ required: true, type: Number })
  limit!: number

  /**
   * The limit of the subject's partner team (parent)
   */
  @Prop({ required: true, type: Number })
  parentLimit!: number

  /**
   * Allows the component to be disabled externally, if, for example, there's a
   * related backend request that's in progress.
   */
  @Prop({ required: false, default: false, type: Boolean })
  disabled!: boolean

  /**
   * Holds temporary new value for the limit, before we dispatch a save event
   * and it's persisted to the backend by the parent component
   */
  newLimit: number = 0

  /**
   * Determines whether the limit checkbox is checked or not.
   *
   * Updated on mount or when we receive data from app, based on the relationship
   * between `limit` and `parentLimit`.
  */
  isLimited: boolean = true

  toggleLimit (value: boolean): void {
    if (!value) {
      /**
       * Tells the parent to perform anything needed to reset the limit of this
       * client to the partner team's limit.
       *
       * This should result in a change to the store state, where this triggers
       * a change to `limit` and `parentLimit` props, ending up in an automated
       * update to `this.isLimited`
       */
      this.$emit('reset-limit')
    }

    this.isLimited = value
  }

  setData (): void {
    this.newLimit = this.limit
    this.isLimited = this.limit < this.parentLimit
  }

  mounted (): void {
    this.setData()
  }

  @Watch('limit', { immediate: true })
  onLimit = this.setData

  @Watch('parentLimit', { immediate: true })
  onParentLimit = this.setData

  confirmLimit (): void {
    /**
     * Tells the parent we have confirmed the new limit, so it should now be
     * persisted to the backend.
     *
     * This should result in a change to stored data, eventually trigerring
     * a change in the `limit` prop.
     */

    this.$emit('set-limit', this.newLimit)
  }
}
</script>

<style lang="scss" scoped>
.usage-limiter {
  display: grid;
  grid-template-columns: auto min-content auto;
  align-items: center;
  column-gap: 10px;
}

.usage-limiter > * {
  grid-row: 1;
}

.usage-limiter__checkbox {
  grid-column: 1;
}

.usage-limiter__input,
.usage-limiter__input-width {
  grid-column: 2;
  text-align: center;
}

.usage-limiter__input {
  width: 100%;
}

.usage-limiter__input-width {
  padding: 0 10px;
  font-size: 14px;
  min-width: 50px;
}

.usage-limiter__button {
  grid-column: 3;
}
</style>
