<template>
  <model-button
    v-tooltip="{
      content: isError ? 'This training session crashed. Please contact us.' : ''
    }"
    class="training-button"
    :class="{ 'training-button-error': isError }"
    :color="color"
    :text="text"
    @click="notify"
  />
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'

import { TrainingSessionPayload } from '@/store/types'

import ModelButton from './ModelButton.vue'

@Component({ name: 'training-button', components: { ModelButton } })
export default class TrainingButton extends Vue {
  @Prop({ required: true, type: Object as () => TrainingSessionPayload })
  trainingSession!: TrainingSessionPayload

  get color (): string {
    return this.isError ? 'negative' : 'warning'
  }

  get isError (): boolean {
    const { gust, status } = this.trainingSession
    return status === 'crashed' || (gust && gust.status === 'stopped' && this.isPending)
  }

  get isScheduled (): boolean {
    const { gust } = this.trainingSession
    return (!gust || gust.status !== 'available') && this.isPending
  }

  get isPending (): boolean {
    const { status } = this.trainingSession
    const pendingStatuses = ['pending_export', 'pending']
    return pendingStatuses.indexOf(status) >= 0
  }

  get text (): string {
    if (this.isError) { return 'Error' }
    if (this.isScheduled) { return 'Scheduled' }
    return 'Training'
  }

  notify () {
    let content = "This model hasn't finished training yet. Come back later to run it."
    if (this.isError) {
      content = 'This training session crashed. Please contact us.'
    } else if (this.isScheduled) {
      content = 'This model is going to be trained soon. Come back later to run it.'
    }
    this.$store.dispatch('toast/notify', { content })
  }
}
</script>

<style lang="scss" scoped>
.training-button {
  background-color: $colorLightEgg;
  border-color: $colorEgg;
  color: $colorEgg;
}

.training-button-error {
  background-color: rgba($color: $colorCrimsonLight, $alpha: 0.2);
  border-color: $colorCrimson;
  color: $colorCrimson;
}
</style>
