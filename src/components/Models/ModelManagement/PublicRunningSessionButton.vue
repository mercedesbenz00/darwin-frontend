<template>
  <model-button
    class="public-running-session-button"
    :class="`public-running-session-button--${text}`"
    :color="color"
    :text="text"
    @click="onClick"
  />
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'

import { RunningSessionPayload } from '@/store/types'

import ModelButton from './ModelButton.vue'

/**
 * Renders a button for public running sessions, which can't be clicked.
 */
@Component({ name: 'public-running-session-button', components: { ModelButton } })
export default class UpdateButton extends Vue {
  @Prop({ required: true, type: Object as () => RunningSessionPayload })
  runningSession!: RunningSessionPayload

  get color (): string {
    const { status } = this
    if (status === 'running') { return 'positive' }
    if (status === 'starting') { return 'warning' }
    return 'secondary'
  }

  get status (): string {
    const { runningSession } = this
    if (runningSession.meta.num_instances_available > 0) { return 'running' }
    if (runningSession.meta.num_instances_starting > 0) { return 'starting' }
    return 'stopped'
  }

  get text (): string {
    const { status } = this
    if (status === 'running') { return 'Running' }
    if (status === 'starting') { return 'Starting' }
    return 'Start'
  }

  onClick () {
    this.$store.dispatch('toast/notify', {
      content: `${this.runningSession.name} is a public Model and cannot be updated.`
    })
  }
}
</script>

<style lang="scss" scoped>
.public-running-session-button {
  background-color: $colorFeatherFadeLight;
}

.public-running-session-button:hover {
  color: $colorFeatherTeal;
}

.public-running-session-button:active {
  opacity: 1.0;
}

.public-running-session-button--start {
  background-color: $colorAliceBlue;
  border-color: $colorAliceNight;
  color: $colorAliceNight;
}

.public-running-session-button--start:hover {
  background-color: $colorAliceBlue;
  border-color: $colorAliceNight;
  color: $colorAliceNight;
}

.public-running-session-button--starting {
  background-color: $colorLightEgg;
  border-color: $colorEgg;
  color: $colorEgg;
}

.public-running-session-button--starting:hover {
  background-color: $colorLightEgg;
  border-color: $colorEgg;
  color: $colorEgg;
}
</style>
