<template>
  <div
    v-if="runningSession"
    v-click-outside="cancelUpdate"
    class="update-settings"
  >
    <h2
      v-if="isActive"
      class="update-settings__header"
    >
      Update {{ runningSession.name }}
    </h2>
    <h2
      v-else
      class="update-settings__header"
    >
      Start {{ runningSession.name }}
    </h2>
    <p
      v-if="isActive"
      class="update-settings__description"
    >
      Pick a number of servers to update your model.
      Once updated, you'll be able to use it in model stages or as an API.
    </p>
    <p
      v-else
      class="update-settings__description"
    >
      Pick a number of servers to start your model.
      Once started, you'll be able to use it in model stages or as an API.
    </p>
    <div class="update-settings__section">
      <instance-count
        :auto-start.sync="autoStart"
        :auto-stop.sync="autoStop"
        :minimum.sync="minimum"
        :maximum.sync="maximum"
      />
    </div>
    <deployment-cost
      class="update-settings__cost"
      :instance-count="minimum"
      :device="runningSession.device"
    />
    <div class="update-settings__footer">
      <secondary-button @click="cancelUpdate">
        Cancel
      </secondary-button>
      <primary-button
        v-if="isActive"
        @click="update"
      >
        UPDATE
      </primary-button>
      <primary-button
        v-else
        @click="update"
      >
        START
      </primary-button>
    </div>
    <div
      v-if="isActive"
      class="update-settings__stop-button"
    >
      <negative-button @click="stopDeployment">
        STOP DEPLOYMENT
      </negative-button>
    </div>
  </div>
</template>

<script lang="ts">

import { Component, Vue, Watch } from 'vue-property-decorator'
import { State } from 'vuex-class'

import DoubleSlider from '@/components/Models/DoubleSlider.vue'
import { resolveRunningSessionStatus } from '@/components/Models/utils'
import { updateModel } from '@/store/modules/neuralModel/actions/updateModel'
import { StoreActionPayload, RunningSessionPayload } from '@/store/types'
import { instanceCost, requestsPerSecond } from '@/utils'

import DeploymentCost from './DeploymentCost.vue'
import InstanceCount from './InstanceCount.vue'

/**
 * If there is a selected running session in the store,
 * this will render the update UI.
 *
 * Paired with <update-button> (UpdateButton.vue), which selects a trained
 * model on click.
 *
 * It will render filling all available container space, so it's up to the
 * parent to contain it.
 */
@Component({
  name: 'update-settings',
  components: {
    DeploymentCost,
    DoubleSlider,
    InstanceCount
  }
})
export default class UpdateSettings extends Vue {
  @State(state => state.neuralModel.selectedRunningSession)
  runningSession!: RunningSessionPayload | null

  loading: boolean = false

  autoStart: boolean = true
  autoStop: boolean = true
  minimum: number = 0
  maximum: number = 0

  mounted (): void {
    this.setData()
  }

  @Watch('runningSession') onRunningSession (): void {
    this.setData()
  }

  setData (): void {
    const { runningSession } = this
    if (!runningSession) { return }
    this.minimum = runningSession.min || 1
    this.maximum = runningSession.max || 1
    this.autoStart = runningSession.auto_start
    this.autoStop = runningSession.auto_stop
  }

  get isActive (): boolean {
    const { runningSession } = this
    if (!runningSession) { return false }
    const status = resolveRunningSessionStatus(runningSession)
    return status === 'starting' || status === 'running'
  }

  get maxRequests (): number {
    return requestsPerSecond(this.maximum)
  }

  get minimumCost (): string {
    const { minimum, runningSession } = this
    if (!runningSession) { return 'N/A' }
    return instanceCost(minimum)
  }

  get maximumCost (): string {
    const { maximum, runningSession } = this
    if (!runningSession) { return 'N/A' }
    return instanceCost(maximum)
  }

  onMaximum (value: number): void {
    this.maximum = value < 1 ? 1 : value
    if (this.maximum < this.minimum) { this.minimum = this.maximum }
  }

  onMinimum (value: number): void {
    this.minimum = value < 1 ? 1 : value
    if (this.minimum > this.maximum) { this.maximum = this.minimum }
  }

  update (): void {
    this.updateModel(this.maximum, this.minimum, this.autoStart, this.autoStop)
  }

  stopDeployment (): void {
    this.updateModel(0, 0)
  }

  async updateModel (
    maximumInstances: number,
    minimumInstances: number,
    autoStart?: boolean,
    autoStop?: boolean
  ): Promise<void> {
    const { runningSession } = this

    if (!runningSession) { throw new Error('Invalid session update. Running session is not set.') }

    const payload: StoreActionPayload<typeof updateModel> = {
      autoStart,
      autoStop,
      maximumInstances,
      minimumInstances,
      runningSession
    }
    const { error } = await this.$store.dispatch('neuralModel/updateModel', payload)

    if (error) {
      return this.$store.dispatch('toast/warning', { content: error.message })
    }

    this.cancelUpdate()
  }

  cancelUpdate (): void {
    this.$store.commit('neuralModel/SELECT_RUNNING_SESSION', null)
  }
}
</script>

<style lang="scss" scoped>
.update-settings {
  display: grid;
  grid-auto-flow: row;
  row-gap: 25px;
  background: $colorAliceBlueLight;
  padding: 30px;
}

.update-settings__header {
  @include typography(lg-1, headlines, bold);
  text-align: center;
}

.update-settings__description {
  @include typography(md-1, Mulish);
}

.update-settings__section {
  padding: 15px;
  background: $colorWhite;
}

.update-settings__cost {
  margin-bottom: 35px;
  text-align: right;
}

.update-settings__footer {
  @include row--distributed;
}

.update-settings__stop-button {
  @include row--distributed;

  button {
    width: 100%;
  }
}
</style>
