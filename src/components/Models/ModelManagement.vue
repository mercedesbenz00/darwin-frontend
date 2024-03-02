<template>
  <div class="model-management">
    <deploy-settings class="model-management__deployer" />
    <update-settings class="model-management__updater" />
    <model-list-header @sort="sort" />
    <gallery
      :calculate-card-proportion="calculateCardProportion"
      :items="neuralModelModels"
      :preferred-list-item-height="65"
      :empty-message="'No models have been trained on your data yet'"
      :view-mode="1"
      name="Your Models"
      class="model-management__gallery"
    >
      <template #list-item="{ item: model }">
        <model-list-item :model="model" />
      </template>
    </gallery>
    <div
      v-if="publicModels.length > 0"
      class="model-management__public-models"
    >
      <h3 class="model-management__public-models__header">
        Public Models
      </h3>
      <gallery
        :calculate-card-proportion="calculateCardProportion"
        :items="publicModels"
        :preferred-list-item-height="65"
        :view-mode="1"
        name="Public Models"
        class="model-management__gallery"
      >
        <template #list-item="{ item: model }">
          <model-list-item :model="model" />
        </template>
      </gallery>
    </div>
    <model-channel-subscriber />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { State } from 'vuex-class'

import Gallery from '@/components/Common/Gallery/Gallery.vue'
import { TeamPayload } from '@/store/modules/admin/types'
import {
  TrainedModelPayload,
  TrainingSessionPayload,
  RunningSessionPayload
} from '@/store/types'
import { updateLocale } from '@/utils/time'

import DeploySettings from './ModelManagement/DeploySettings.vue'
import ModelListHeader from './ModelManagement/ModelListHeader.vue'
import ModelListItem from './ModelManagement/ModelListItem.vue'
import UpdateSettings from './ModelManagement/UpdateSettings.vue'
import ModelChannelSubscriber from './Renderless/ModelChannelSubscriber'
import { ModelItem } from './types'
import {
  assignRunningSessionDatasetSlug,
  assignTrainedModelDatasetSlug,
  compare,
  convertRunningSession,
  convertTrainedModel,
  convertTrainingSession,
  sortWrapper
} from './utils'

@Component({
  name: 'model-management',
  components: {
    DeploySettings,
    Gallery,
    ModelChannelSubscriber,
    ModelListHeader,
    ModelListItem,
    UpdateSettings
  }
})
export default class ModelManagement extends Vue {
  sortField: string = 'name'
  sortDirection: 'ascending' | 'descending' = 'ascending'

  mounted (): void {
    updateLocale({ s: 'a minute', ss: 'a minute' })
    this.sort('date', 'descending')
  }

  @State(state => state.neuralModel.trainedModels)
  trainedModels!: TrainedModelPayload[]

  @State(state => state.neuralModel.trainingSessions)
  trainingSessions!: TrainingSessionPayload[]

  @State(state => state.neuralModel.runningSessions)
  runningSessions!: RunningSessionPayload[]

  @State(state => state.team.currentTeam)
  currentTeam!: TeamPayload | null

  /**
   * Public models are models that have been marked as publicly accessible, and so they
   * can be started independently by a different team from the one that trained it.
   * They are taken from the `models` getter, which lists all models served for a specific team,
   * based on the `team_id` field.
   */
  get publicModels (): ModelItem[] {
    const { currentTeam, models } = this
    if (!currentTeam) { return [] }
    return models.filter(model => {
      if (!model.runningSession) {
        return model.trainedModel ? model.trainedModel.team_id !== currentTeam.id : false
      }
      return model.trainedModel
        ? model.runningSession.team_id !== model.trainedModel.team_id
        : false
    })
  }

  /**
   * Neural network models are models that have been trained by the team that is listing them.
   * Here, they're taken from the `models` getter by simply rejecting models that already
   * listed in the public models section.
   */
  get neuralModelModels (): ModelItem[] {
    const { publicModels, models } = this
    return models.filter(model => !publicModels.includes(model))
  }

  get models (): ModelItem[] {
    // NOTE: A pair of computed properties, first returning the unsorted items,
    // the second sorting, would be more performant, but for some reason, it
    // does not trigger the re-render. Might be related to usage of gallery.
    const { runningSessions, trainedModels, trainingSessions } = this

    const sessionItems = trainingSessions
      .map(t => convertTrainingSession(t))
      .filter(t => ['completed', 'stopped'].indexOf(t.trainingSession.status) === -1)

    const trainedModelItems = trainedModels
      .map(t => convertTrainedModel(t))
      // We need an extra step to assign a dataset slug by finding an association
      // with a trained model because we don't preload those associations on Wind
      // When that changes, we can simplify the dataset slug assignment by simply
      // looking into the associated trained model.
      .map(t => assignTrainedModelDatasetSlug(t, trainingSessions))

    const runningSessionItems = runningSessions
      .map(s => convertRunningSession(s))
      // We need an extra step to assign a dataset slug by finding an association
      // with a trained model because we don't preload those associations on Wind
      // When that changes, we can simplify the dataset slug assignment by simply
      // looking into the associated trained model.
      .map(s => assignRunningSessionDatasetSlug(s, trainingSessions))

    // if a trained model has associated running sessions, we show all of them
    // instead of the trained model
    const instantiatedModelids = runningSessions.map(m => m.trained_model_id)
    const uninstatinedTrainedModelItems = trainedModelItems
      .filter(t => !instantiatedModelids.includes(t.id))

    const unsortedModels = uninstatinedTrainedModelItems
      .concat(sessionItems)
      .concat(runningSessionItems)

    const { sortField: field, sortDirection: direction } = this

    const orderModifier = direction === 'ascending' ? 1 : -1
    const sortFn = (
      a: ModelItem,
      b: ModelItem
    ): number => compare(a, b, sortWrapper(field), orderModifier)
    const sorted = unsortedModels.sort(sortFn)
    return sorted
  }

  sort (field: string, direction: 'ascending' | 'descending'): void {
    this.sortField = field
    this.sortDirection = direction
  }

  calculateCardProportion (): number {
    return 0
  }
}
</script>

<style lang="scss" scoped>
@import "./modelSettingsDialog.scss";

.model-management__gallery {
  height: auto;

  :deep(.vue-recycle-scroller__item-wrapper) {
    margin: 0;
    width: 100% !important;
  }
}

.model-management__deployer,
.model-management__updater {
  @include modelSettingsDialog;
}

.model-management__public-models {
  margin-top: 20px;
}

.model-management__public-models__header {
  @include typography(xl, inter, bold);
  color: $color90Black;
  margin-bottom: 10px;
}
</style>
