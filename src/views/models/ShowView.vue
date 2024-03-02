<template>
  <show-running-session
    v-if="runningSession"
    :running-session="runningSession"
    :training-session="trainingSession"
  />
  <show-trained-model
    v-else-if="trainedModel"
    :trained-model="trainedModel"
    :training-session="trainingSession"
  />
  <show-training-session
    v-else-if="trainingSession"
    :training-session="trainingSession"
  />
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { State } from 'vuex-class'

import ShowRunningSession from '@/components/Models/ShowRunningSession.vue'
import ShowTrainedModel from '@/components/Models/ShowTrainedModel.vue'
import ShowTrainingSession from '@/components/Models/ShowTrainingSession.vue'
import { RunningSessionPayload, TrainedModelPayload, TrainingSessionPayload } from '@/store/types'

@Component({
  name: 'show-view',
  components: { ShowRunningSession, ShowTrainedModel, ShowTrainingSession }
})
export default class ShowView extends Vue {
  @State(state => state.neuralModel.runningSessions)
  runningSessions!: RunningSessionPayload[]

  get runningSession (): RunningSessionPayload | null {
    return this.runningSessions.find(g => g.id === this.$route.params.modelId) || null
  }

  @State(state => state.neuralModel.trainedModels)
  trainedModels!: TrainedModelPayload[]

  get trainedModel (): TrainedModelPayload | null {
    return this.trainedModels.find(m => m.id === this.$route.params.modelId) || null
  }

  @State(state => state.neuralModel.trainingSessions)
  trainingSessions!: TrainingSessionPayload[]

  get trainingSession (): TrainingSessionPayload | undefined {
    const trainingSession = this.trainingSessions.find(s => s.id === this.$route.params.modelId)
    if (trainingSession) { return trainingSession }

    const { runningSession, trainedModel } = this

    if (trainedModel) {
      const trainingSession =
        this.trainingSessions.find(s => s.trained_model_id === trainedModel.id)
      if (trainingSession) { return trainingSession }
      return
    }

    if (runningSession) {
      const trainingSession =
        this.trainingSessions.find(s => s.trained_model_id === runningSession.trained_model_id)
      if (trainingSession) { return trainingSession }
    }
  }

  mounted (): void {
    const { runningSession, trainedModel, trainingSession } = this
    if (!runningSession && !trainedModel && !trainingSession) {
      const content =
        'The requested model was not found. You can try searching for it from the index.'
      this.$store.dispatch('toast/warning', { content })
      this.$router.push({ name: 'ModelsIndex' })
    }
    if (!trainingSession) { return }

    const { gust, status } = trainingSession
    if (status === 'crashed' || (gust && gust.status === 'stopped' && status === 'pending')) {
      const content = 'The training session crashed. Please contact us.'
      this.$store.dispatch('toast/warning', { content })
      this.$router.push({ name: 'ModelsIndex' })
    }
  }
}
</script>
