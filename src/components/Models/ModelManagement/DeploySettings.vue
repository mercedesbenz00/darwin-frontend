<template>
  <div
    v-if="trainedModel"
    v-click-outside="cancelDeploy"
    class="deploy-settings"
  >
    <h2 class="deploy-settings__header">
      Start {{ trainedModel.name }}
    </h2>
    <p class="deploy-settings__description">
      Pick a number of servers to start your model.
      Once started, you'll be able to use it in model stages or as an API.
    </p>
    <instance-count
      class="deploy-settings__section"
      :auto-start.sync="autoStart"
      :auto-stop.sync="autoStop"
      :minimum.sync="minimum"
      :maximum.sync="maximum"
    />
    <deployment-cost
      class="deploy-settings__cost"
      :instance-count="minimum"
      :device="hardwareType"
    />

    <div class="deploy-settings__footer">
      <secondary-button @click="cancelDeploy">
        Cancel
      </secondary-button>
      <primary-button @click="deploy">
        START
      </primary-button>
    </div>
  </div>
</template>

<script lang="ts">

import { Component, Vue, Watch } from 'vue-property-decorator'
import { State } from 'vuex-class'

import InputField from '@/components/Common/InputField/V1/InputField.vue'
import { deployModel } from '@/store/modules/neuralModel/actions/deployModel'
import { ModelDevice } from '@/store/modules/neuralModel/types'
import { StoreActionPayload, TrainedModelPayload } from '@/store/types'

import DeploymentCost from './DeploymentCost.vue'
import InstanceCount from './InstanceCount.vue'

/**
 * If there is a selected trained model in the store,
 * this will render the deployment UI.
 *
 * Paired with <deploy-button> (DeployButton.vue), which selects a trained
 * model on click.
 *
 * It will render filling all available container space, so it's up to the
 * parent to contain it.
 */
@Component({
  name: 'deploy-settings',
  components: {
    DeploymentCost,
    InputField,
    InstanceCount
  }
})
export default class DeploySettings extends Vue {
  @State(state => state.neuralModel.selectedTrainedModel)
  trainedModel!: TrainedModelPayload | null

  autoStart: boolean = true
  autoStop: boolean = true
  loading: boolean = false
  minimum: number = 1
  maximum: number = 1

  name: string = ''

  mounted (): void {
    this.setData()
  }

  @Watch('trainedModel') onTrainedModel (): void {
    this.setData()
  }

  setData (): void {
    const { trainedModel } = this
    if (!trainedModel) { return }
    this.name = trainedModel.name
  }

  get hardwareType (): ModelDevice {
    const { trainedModel } = this
    if (!trainedModel) { return ModelDevice.GPU }
    return trainedModel.model_template.devices.includes(ModelDevice.GPU)
      ? ModelDevice.GPU
      : ModelDevice.CPU
  }

  async deploy (): Promise<void> {
    const {
      autoStart,
      autoStop,
      hardwareType,
      maximum,
      minimum,
      name,
      trainedModel
    } = this

    if (!trainedModel) { throw new Error('Invalid deploy attempt. Model must be set') }

    const payload: StoreActionPayload<typeof deployModel> = {
      autoStart,
      autoStop,
      device: hardwareType,
      isPublic: false,
      maximumInstances: maximum,
      minimumInstances: minimum,
      name,
      trainedModel
    }
    const { error } = await this.$store.dispatch('neuralModel/deployModel', payload)

    if (error) {
      return this.$store.dispatch('toast/warning', { content: error.message })
    }

    this.cancelDeploy()
  }

  cancelDeploy (): void {
    this.$store.commit('neuralModel/SELECT_TRAINED_MODEL', null)
  }
}
</script>

<style lang="scss" scoped>
.deploy-settings {
  display: grid;
  grid-auto-flow: row;
  row-gap: 25px;
  background: $colorAliceBlueLight;
  padding: 30px;
}

.deploy-settings__header {
  @include typography(lg-1, headlines, bold);
  text-align: center;
}

.deploy-settings__description {
  @include typography(md-1, Mulish);
}

.deploy-settings__section {
  padding: 15px;
  background: $colorWhite;
}

.deploy-settings__cost {
  text-align: right;
}

.deploy-settings__footer {
  @include row--distributed;
}
</style>
