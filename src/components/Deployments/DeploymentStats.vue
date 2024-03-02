<template>
  <div class="stats__row">
    <div class="stats">
      <model-request-chart :running-session="runningSession" />
    </div>
    <div class="stats">
      <instance-count-chart :running-session="runningSession" />
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'

import { RunningSessionPayload } from '@/store/types'

import InstanceCountChart from './InstanceCountChart.vue'
import ModelRequestChart from './ModelRequestChart.vue'

@Component({
  name: 'deployment-stats',
  components: {
    InstanceCountChart,
    ModelRequestChart
  }
})
export default class DeploymentStats extends Vue {
  @Prop({ required: true, type: Object })
  runningSession!: RunningSessionPayload
}
</script>

<style lang="scss" scoped>
.stats__row {
  @include row--distributed;
  margin-top: 10px;
}

.stats {
  background-color: transparent;
  border-radius: 5px;
}
</style>
