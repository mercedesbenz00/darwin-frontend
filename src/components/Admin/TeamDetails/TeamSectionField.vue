<template>
  <div
    class="field"
    :class="{ 'field--full': fullWidth }"
  >
    <label class="field__label">
      <slot name="label" />
    </label>
    <div class="field__value">
      <slot name="value" />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

@Component({
  name: 'team-section-field'
})
export default class TeamSectionField extends Vue {
  @Prop({ required: false, default: false, type: Boolean as () => boolean })
  fullWidth!: boolean
}
</script>

<style lang="scss" scoped>
.field {
  width: 300px;
  @include col;
}

.field.field--full {
  width: 100%;
}

.field.field__label {
  font-weight: bold;
  margin-bottom: 10px;
}
</style>
