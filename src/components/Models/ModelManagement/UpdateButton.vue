<template>
  <model-button
    class="update-button"
    :class="`update-button--${text}`"
    :color="color"
    :text="text"
    :hover-text="hoverText"
    @click="startUpdate"
  />
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'

import { resolveRunningSessionStatus } from '@/components/Models/utils'
import { RunningSessionPayload } from '@/store/types'

import ModelButton from './ModelButton.vue'

/**
 * Renders a button which, when clicked, selects a running session in the store.
 *
 * Paired with `<update-settings> (UpdateSettings.vue)` which renders
 * deployment UI for the selected model.
 *
 * The button renders a different text on hover.
 */
@Component({ name: 'update-button', components: { ModelButton } })
export default class UpdateButton extends Vue {
  @Prop({ required: true, type: Object as () => RunningSessionPayload })
  runningSession!: RunningSessionPayload

  get color (): string {
    switch (resolveRunningSessionStatus(this.runningSession)) {
    case 'starting':
      return 'warning'
    case 'stopping':
      return 'warning'
    case 'running':
      return 'positive'
    default:
      return 'secondary'
    }
  }

  get text (): string {
    switch (resolveRunningSessionStatus(this.runningSession)) {
    case 'starting':
      return 'Starting'
    case 'stopping':
      return 'Stopping'
    case 'running':
      return 'Running'
    default:
      return 'Start'
    }
  }

  get hoverText (): string {
    const { text } = this
    return text === 'Start' ? text : 'Update'
  }

  startUpdate (): void {
    this.$store.commit('neuralModel/SELECT_RUNNING_SESSION', this.runningSession)
  }
}
</script>

<style lang="scss" scoped>
.update-button {
  background-color: $colorFeatherFadeLight;
}

.update-button:hover {
  color: $colorFeatherTeal;
}

.update-button--start {
  background-color: $colorAliceBlue;
  border-color: $colorAliceNight;
  color: $colorAliceNight;
}

.update-button--start:hover {
  background-color: $colorAliceBlue;
  border-color: $colorAliceNight;
  color: $colorAliceNight;
}

.update-button--starting {
  background-color: $colorLightEgg;
  border-color: $colorEgg;
  color: $colorEgg;
}

.update-button--starting:hover {
  background-color: $colorLightEgg;
  border-color: $colorEgg;
  color: $colorEgg;
}

.update-button--stopping {
  background-color: $colorLightEgg;
  border-color: $colorEgg;
  color: $colorEgg;
}

.update-button--stopping:hover {
  background-color: $colorLightEgg;
  border-color: $colorEgg;
  color: $colorEgg;
}
</style>
