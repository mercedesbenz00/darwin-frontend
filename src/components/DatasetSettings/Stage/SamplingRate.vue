<template>
  <div class="sampling-rate">
    <label>
      <input-field
        v-model="percentage"
        :disabled="disabled"
        type="number"
        min="0"
        max="100"
      />
      <span>%</span>
    </label>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'

import InputField from '@/components/Common/InputField/V1/InputField.vue'

@Component({ name: 'sampling-rate', components: { InputField } })
export default class SamplingRate extends Vue {
  @Prop({ required: true, type: Number as () => number })
  value!: number

  @Prop({ required: false, type: Boolean as () => boolean, default: false })
  disabled!: boolean

  get percentage (): string {
    return (this.value * 100).toFixed(0)
  }

  set percentage (valueStr: string) {
    const valueInt = parseInt(valueStr)
    const percentage =
      valueInt > 100
        ? 100
        : valueInt < 0 ? 0 : valueInt
    this.$emit('change', percentage / 100)
  }
}
</script>

<style lang="scss" scoped>
.sampling-rate {
  width: 40px;
  height: 24px;
  @include typography(md);
}

.sampling-rate label {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
}

.sampling-rate :deep(input::-webkit-outer-spin-button),
.sampling-rate :deep(input::-webkit-inner-spin-button) {
  -webkit-appearance: none;
  margin: 0;
}

.sampling-rate :deep(input[type=number]) {
  @include typography(md);
  -moz-appearance: textfield;
  background: $colorAliceShade;
  padding: 2px 3px;
  width: 27px;
  height: 24px;
  text-align: center;
  border-radius: 5px;
}
</style>
