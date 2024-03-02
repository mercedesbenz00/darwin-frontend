<template>
  <button
    class="item"
    @click="$emit('click')"
    :disabled="disabled"
  >
    <status-button
      class="item__icon"
      :type="type"
    />

    <div class="item__label">
      {{ label }}
    </div>
  </button>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import StatusButton from '@/components/WorkView/Common/StatusButton/V1/StatusButton.vue'
import { StageType } from '@/store/types'

/**
 * Layout component depicting a single item in the v2 status (set stage) context menu.
 */
@Component({
  name: 'status-item',
  components: { StatusButton }
})
export default class StatusItem extends Vue {
  @Prop({ required: false, default: false, type: Boolean })
  disabled!: boolean

  @Prop({ required: true, type: String as () => StageType })
  type!: StageType

  @Prop({ required: true, type: String })
  label!: string
}
</script>

<style lang="scss" scoped>
.item {
  width: 100%;
  background: $colorWhite;
  display: grid;
  padding: 7px 14px;
  grid-template-columns: 20px 1fr;
  column-gap: 10px;
  justify-items: start;
  align-items: center;
  transition: background-color .2s ease;
  padding: 5px;
}

.item:not(:disabled):hover,
.item:not(:disabled):active {
  background: $colorAliceBlue;
}

.item__icon {
  width: 20px;
  height: 20px;

  border-radius: 50%;
  @include workflow-status-background-color;
  @include workflow-status-color;
}

.item__label {
  color: $color90Black;
}
</style>
