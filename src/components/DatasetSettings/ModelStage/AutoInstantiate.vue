<template>
  <div class="auto-instantiate">
    <check-box
      :value="value"
      label="Auto Start"
      size="small"
      @change="$emit('change')"
    />
    <info>
      If enabled, new items will be sent to the model stage as soon as
      they are done processing and reach "New" status.
    </info>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'

import CheckBox from '@/components/Common/CheckBox/V1/CheckBox.vue'
import Info from '@/components/Common/Info.vue'

@Component({ name: 'auto-instantiate', components: { CheckBox, Info } })
export default class AutoInstantiate extends Vue {
  @Prop({ required: true, type: Boolean })
  value!: boolean
}
</script>

<style lang="scss" scoped>
.auto-instantiate {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
}
</style>
