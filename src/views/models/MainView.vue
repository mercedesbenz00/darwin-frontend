<template>
  <router-view v-if="!loading" />
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

@Component({ name: 'main-view' })
export default class MainView extends Vue {
  loading: boolean = true
  async mounted () {
    this.loading = true

    await Promise.all([
      this.$store.dispatch('dataset/getDatasets'),
      this.$store.dispatch('neuralModel/loadPublishedModelTemplates'),
      this.$store.dispatch('neuralModel/loadTrainedModels'),
      this.$store.dispatch('neuralModel/loadTrainingSessions'),
      this.$store.dispatch('neuralModel/loadRunningSessions')
    ])

    this.loading = false
  }
}
</script>
