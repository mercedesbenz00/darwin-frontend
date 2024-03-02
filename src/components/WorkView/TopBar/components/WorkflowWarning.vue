<template>
  <div class="work-tracker">
    <warning-icon
      v-if="channelStatus === 'error'"
      v-tooltip="tooltip"
      class="work-tracker__warning"
    />
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import { State } from 'vuex-class'

import { WarningIcon } from '@/components/WorkView/TopBar/assets/icons'
import { WorkviewTrackerState } from '@/store/modules/workviewTracker'
import { TooltipOptions } from '@/types'

@Component({ name: 'workflow-warning', components: { WarningIcon } })
export default class Warning extends Vue {
  @Prop({ required: false, default: null, type: String as () => string })
  topic!: string

  @State(state => state.workviewTracker.status)
  channelStatus!: WorkviewTrackerState['status']

  @Watch('channelStatus')
  onChannelStatus (
    status: WorkviewTrackerState['status'] | null,
    previous: WorkviewTrackerState['status'] | null
  ): void {
    if (status !== 'error') { return }

    this.$store.dispatch('toast/warning', {
      content: (
        "We couldn't initialize work tracking. " +
        'Your time will not be tracked. Try refreshing your browser.'
      )
    })

    this.$sentry.captureEvent({
      message: "Tracker couldn't connect to workview channel",
      extra: {
        topic: this.topic,
        oldChannelStatus: previous,
        newChannelStatus: status,
        trackerState: this.$store.state.workviewTracker
      }
    })
  }

  get tooltip (): TooltipOptions {
    return {
      content: `
        <p>There was an issue connecting to work tracking. Yout time will not be tracked.</p>
        <p>Try refreshing your browser, or switching to a different browser.</p>
        <p>If the problem persists, contact support.</p>
      `,
      classes: 'tooltip--work-tracker',
      placement: 'bottom',
      delay: { show: 300, hide: 300 }
    }
  }
}
</script>

<!-- eslint-disable vue-scoped-css/enforce-style-type -->
<style lang="scss">
.tooltip--work-tracker {
  .tooltip-inner {
    display: table;
  }
}
</style>

<!-- eslint-disable vue-scoped-css/enforce-style-type -->
<style lang="scss">
.fade-enter-active, .fade-leave-active {
  transition: opacity .5s;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}
</style>

<style lang="scss" scoped>
.work-tracker {
  @include row--distributed;

  &__warning {
    @include row--center;
    justify-self: flex-start;

    &:focus,
    &:active {
      outline: none;
    }
  }
}
</style>
