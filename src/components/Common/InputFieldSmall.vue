<template>
  <input-field
    class="input-field-small"
    v-bind="$props"
    v-on="$listeners"
  />
</template>

<script lang="ts">
import { Component } from 'vue-property-decorator'

import InputField from './InputField/V1/InputField.vue'

@Component({
  name: 'input-field-small',
  components: { InputField }
})
export default class InputFieldSmall extends InputField {}
</script>

<style lang="scss" scoped>
.input-field-small :deep(input) {
  height: 26px;
}
</style>
