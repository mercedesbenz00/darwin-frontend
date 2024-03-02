<template>
  <div class="work-tracker">
    <work-timer
      v-if="timeInSeconds !== 0"
      v-tooltip="tooltip"
      class="work-tracker__work-timer"
      :time-in-seconds="timeInSeconds"
      :status="timerStatus"
      @click="toggleTimer"
    />
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch, Prop } from 'vue-property-decorator'
import { State } from 'vuex-class'

import WorkTimer from '@/components/WorkView/Tracker/WorkTimer.vue'
import { WorkviewTrackerState } from '@/store/modules/workviewTracker'
import { RootState } from '@/store/types'
import { TooltipOptions } from '@/types'

@Component({ name: 'work-tracker', components: { WorkTimer } })
export default class WorkTracker extends Vue {
  // ui props and data

  @Prop({ required: false, default: null, type: String as () => string })
  topic!: string

  @State(state => state.workviewTracker.timeInSeconds)
  timeInSeconds!: number

  @State(state => state.workviewTracker.timerStatus)
  timerStatus!: WorkviewTrackerState['timerStatus']

  get tooltip (): TooltipOptions {
    return {
      content: `
        <p>
          Total amount of time you spent working on this image in the current and previous sessions.
        </p>
        <p>
          If no actions are performed in this session, the time will reset to the previous amount.
        </p>
        <p>Click to pause timer. Any action will unpause it.</p>
      `,
      classes: 'tooltip--work-tracker',
      placement: 'bottom',
      delay: { show: 300, hide: 300 }
    }
  }

  // mounting setup

  async mounted (): Promise<void> {
    const blurHandler = this.handleFocusChange.bind(this, false)
    window.addEventListener('blur', blurHandler)
    this.$once('hook:beforeDestroy', () => window.removeEventListener('blur', blurHandler))

    const focusHandler = this.handleFocusChange.bind(this, true)
    window.addEventListener('focus', focusHandler)
    this.$once('hook:beforeDestroy', () => window.removeEventListener('focus', focusHandler))

    // this will just join a topic, without actually starting timer or reporting activity
    // onTopic will report activity only if previous topic (second argument) is also set
    await this.onTopic(this.topic, null)

    // this will pause or unpause the timer depending on initial focus state of the document
    // we need this because a user could open workview in a background tab
    this.handleFocusChange(document.hasFocus())
  }

  beforeDestroy (): void {
    this.$store.dispatch('workviewTracker/leaveChannel')
  }

  handleFocusChange (isFocused: boolean): void {
    if (isFocused) {
      this.$store.dispatch('workviewTracker/unpause')
    } else {
      this.$store.dispatch('workviewTracker/pause')
    }
  }

  // UI actions

  toggleTimer (): void {
    this.$store.dispatch('workviewTracker/toggleTimer')
  }

  // reacting to status change

  @State(state => state.workviewTracker.status)
  channelStatus!: WorkviewTrackerState['status']

  @State((state: RootState) => state.workviewTracker.timerStatus === 'started')
  timerRunning!: boolean

  @Watch('topic')
  async onTopic (topic: string | null, oldTopic: string | null): Promise<void> {
    if (oldTopic) { await this.$store.dispatch('workviewTracker/leaveChannel') }
    if (topic) { await this.$store.dispatch('workviewTracker/joinChannel', { topic }) }

    const { timerRunning } = this
    if (!timerRunning) { return }
    if (!oldTopic) { return }

    // Since there's a previous topic, that means user is switching images in workview
    // This is an action that needs to be reported so we continue tracking.
    this.$store.dispatch('workviewTracker/reportActivity')
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

  &__work-timer {
    @include row--center;
    justify-self: flex-end;
  }
}
</style>
