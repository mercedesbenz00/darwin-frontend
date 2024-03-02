<template>
  <div
    v-if="currentTeam"
    class="annotators"
  >
    <div class="annotators__header">
      <h1>{{ teamName }} Annotators</h1>
      <primary-button
        v-if="$can('view_full_datasets')"
        size="medium"
        tag="a"
        class="annotators__header__labeling-button"
        href="https://www.v7labs.com/labeling-service"
        target="_blank"
      >
        + Request annotators
      </primary-button>
    </div>
    <loading-wrapper
      :loading="loading"
      background-color="transparent"
      label="Loading datasets"
      class="annotators__dataset-wrapper"
    >
      <div v-if="datasets.length > 0">
        <annotation-metrics
          v-for="dataset in datasets"
          :key="dataset.id"
          class="annotators__dataset"
          :dataset="dataset"
        />
      </div>
      <annotator-no-datasets v-else />
    </loading-wrapper>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { State } from 'vuex-class'

import AnnotationMetrics from '@/components/Annotators/AnnotationMetrics.vue'
import AnnotatorNoDatasets from '@/components/Annotators/AnnotatorNoDatasets.vue'
import LoadingWrapper from '@/components/Common/LoadingWrapper.vue'
import { DatasetPayload, TeamPayload } from '@/store/types'

@Component({
  name: 'annotators-index-vue',
  components: { AnnotationMetrics, AnnotatorNoDatasets, LoadingWrapper }
})
export default class IndexView extends Vue {
  @State(state => state.dataset.datasets)
  datasets!: DatasetPayload[]

  @State(state => state.team.currentTeam)
  currentTeam!: TeamPayload

  get teamName () {
    return this.currentTeam.name
  }

  mounted () {
    this.loadDatasets()
  }

  loading: boolean = false

  async loadDatasets () {
    this.loading = true
    await this.$store.dispatch('dataset/getDatasets')
    this.loading = false
  }
}
</script>

<style lang="scss" scoped>
.annotators {
  @include col;
  height: 100%;
  overflow: auto;
}

.annotators__header,
.annotators__dataset {
  margin: 23px 50px;
}

.annotators__header {
  @include row--distributed--center;
  margin-bottom: 0;
}

.annotators__header h1 {
  @include typography(xxl, mulish, bold);
  color: $color90Black;
}

.annotators__header__labeling-button  {
  min-width: 145px;
}

.annotators__dataset-wrapper {
  min-height: calc(100% - 100px);
  flex: 1 1 auto;
}
</style>
