<template>
  <numeric-input
    class="new-amount"
    v-bind="$props"
    v-on="$listeners"
  />
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'

import NumericInput from '@/components/Common/NumericInput.vue'

@Component({ name: 'new-amount', components: { NumericInput } })
export default class NewAmount extends Vue {
  @Prop({ required: true, type: Number })
  value!: number

  @Prop({ required: true, type: String })
  label!: string

  @Prop({ required: false, default: 1, type: Number })
  step!: number

  @Prop({ required: true, type: Number })
  min?: number
}
</script>

<style lang="scss" scoped>
.new-amount {
  display: grid;
  grid-template-rows: auto auto;

  > label {
    grid-row: 2;
    @include typography(md-1, headlines, bold);
  }

  :deep(.numeric-input__controls) {
    grid-row: 1;

    > input {
      width: 5ch;
      font-size: 40px;
      line-height: 40px;
      font-weight: bold;
      background: $colorAliceShade;
      box-shadow: inset 0px 1px 3px rgba(145, 169, 192, 0.3);
    }
  }

  :deep(.numeric-input__controls__buttons) {
    border: 2px solid $colorAliceShade;
    border-left: none;
    border-top-right-radius: 3px;
    border-bottom-right-radius: 3px;
    height: 60px;
    overflow: hidden;

    button {
      border-radius: unset;
      background: $colorAliceBlue;
    }
  }

  :deep(.numeric-input__controls__buttons__up) {
    border-bottom-color: $colorAliceShade;
  }
}
</style>
