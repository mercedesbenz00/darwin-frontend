<template>
  <model-button
    class="deploy-button"
    color="secondary"
    text="Start"
    @click="startDeployment"
  />
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'

import { TrainedModelPayload } from '@/store/types'

import ModelButton from './ModelButton.vue'

/**
 * Renders a button which, when clicked, selects a trained model in the store.
 *
 * Paired with `<deploy-settings> (DeploySettings.vue)` which renders
 * deployment UI for the selected model.
 *
 * The button renders a different text on hover.
 */
@Component({ name: 'deploy-button', components: { ModelButton } })
export default class DeployButton extends Vue {
  @Prop({ required: true, type: Object as () => TrainedModelPayload })
  trainedModel!: TrainedModelPayload

  startDeployment (): void {
    this.$store.commit('neuralModel/SELECT_TRAINED_MODEL', this.trainedModel)
  }
}
</script>

<!-- eslint-disable vue-scoped-css/enforce-style-type -->
<style lang="scss">
.deploy-button {
  background-color: $colorAliceBlue;
  border-color: $colorAliceNight;
  color: $colorAliceNight;
}

.deploy-button:hover {
  background-color: $colorAliceBlue;
  border-color: $colorAliceNight;
  color: $colorAliceNight;
}
</style>
