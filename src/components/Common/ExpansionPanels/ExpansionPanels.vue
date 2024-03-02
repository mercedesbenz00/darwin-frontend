<template>
  <ul class="expansion-panels">
    <slot />
  </ul>
</template>

<script lang="ts">
import { Component, ProvideReactive, Vue, Watch } from 'vue-property-decorator'

export type ParentState = {
  active: { [key: string]: boolean }
}

@Component({
  name: 'expansion-panels'
})
export default class ExpansionPanels extends Vue {
  state: ParentState = {
    active: {}
  }

  @ProvideReactive()
  Parent = this.state

  @Watch('state.active')
  onStateActiveIndexChange (value: ParentState['active']): void {
    this.$emit('update:active', value)
  }
}
</script>

<style lang="scss" scoped>
.expansion-panels {
  display: flex;
  flex-direction: column;
  list-style: none;
  margin: 0;
  padding: 0;
}
</style>
