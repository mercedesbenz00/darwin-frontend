<template>
  <div class="session">
    <online-icon
      v-if="online"
      v-tooltip="'Online'"
      class="session__status"
    />
    <offline-icon
      v-else
      v-tooltip="'Offline'"
      class="session__status"
    />
    <div class="session__label">
      {{ label }}
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'

import { resolveRunningSessionStatus } from '@/components/Models/utils'
import { RunningSessionPayload } from '@/store/types'

import OfflineIcon from './assets/offline.svg?inline'
import OnlineIcon from './assets/online.svg?inline'

@Component({ name: 'running-session', components: { OfflineIcon, OnlineIcon } })
export default class RunningSession extends Vue {
  @Prop({ required: true, type: Object as () => RunningSessionPayload })
  runningSession!: RunningSessionPayload

  get online (): boolean {
    const status = resolveRunningSessionStatus(this.runningSession)
    return status === 'running'
  }

  get label (): string {
    return this.runningSession.name
  }
}
</script>

<style lang="scss" scoped>
.session {
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: center;
}

.session__label {
  @include ellipsis;
}
</style>
