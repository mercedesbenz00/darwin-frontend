<template>
  <positive-button
    class="undeploy-button"
    @click="undeploy"
  >
    Undeploy
  </positive-button>
</template>

<script lang="ts">

import { Component, Vue, Prop } from 'vue-property-decorator'

import { undeployModel } from '@/store/modules/neuralModel/actions/undeployModel'
import { StoreActionPayload, RunningSessionPayload } from '@/store/types'

@Component({ name: 'undeploy-button' })
export default class UndeployButton extends Vue {
  @Prop({ required: true, type: Object })
  runningSession!: RunningSessionPayload

  async undeploy () {
    const { runningSession } = this
    const payload: StoreActionPayload<typeof undeployModel> = { runningSession }
    const { error } = await this.$store.dispatch('neuralModel/undeployModel', payload)
    if (error) { return this.$store.dispatch('toast/warning', { content: error.message }) }
  }
}
</script>
