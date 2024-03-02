<template>
  <div>
    <div class="cost__note">
      Estimated Cost
    </div>
    <div class="cost__amount">
      {{ cost }}
      <span class="cost__amount__span">/minute</span>
    </div>
    <div class="cost__note">
      Rounded up to the nearest minute
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'

import { ModelDevice } from '@/store/modules/neuralModel/types'
import { instanceCost } from '@/utils'

@Component({ name: 'deployment-cost' })
export default class DeploymentCost extends Vue {
  @Prop({ required: true, type: Number as () => number })
  instanceCount!: number

  @Prop({
    required: false,
    type: String as () => ModelDevice,
    default: ModelDevice.GPU
  })
  device!: ModelDevice

  get cost (): string {
    return instanceCost(this.instanceCount)
  }
}
</script>

<style lang="scss" scoped>
.cost__amount {
  @include typography(xl, Mulish, bold);
  margin: 7.5px 0;

  .cost__amount__span {
    @include typography(md, Mulish);
    color: $colorAliceNight;
  }
}

.cost__note {
  @include typography(sm, Mulish);
  color: $colorAliceNight;
}
</style>
