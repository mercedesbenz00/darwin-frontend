<template>
  <div class="annotator-overview">
    <div class="annotator-overview__header">
      <h1 class="annotator-overview__title">
        Datasets
      </h1>
    </div>
    <div
      v-loading="datasetsLoading"
      class="annotator-overview__datasets"
    >
      <annotation-tutorial-box class="annotator-overview__tutorial-box" />
      <div
        v-if="!datasetsLoading && datasets.length === 0"
        class="annotator-overview__content-placeholder"
      >
        <div class="annotator-overview__content-placeholder__image" />
        <div class="annotator-overview__content-placeholder__text">
          <div>No images or videos assigned yet.</div>
          <div>
            Once you are invited to a dataset and asked to annotate images or videos,
            you will see them here.
          </div>
        </div>
      </div>
      <div
        v-else-if="!datasetsLoading"
        class="annotator-overview__content"
      >
        <annotator-dataset-card
          v-for="dataset in datasets"
          :key="dataset.id"
          class="annotator-overview__card"
          :dataset="dataset"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'
import { State } from 'vuex-class'

import AnnotationTutorialBox from '@/components/AnnotationTutorialBox/AnnotationTutorialBox.vue'
import { CircleSpinner } from '@/components/Common/LoadingIndicators'
import AnnotatorDatasetCard from '@/components/Dataset/AnnotatorDatasetCard.vue'
import { DatasetPayload, RootState, TeamPayload } from '@/store/types'

@Component({
  name: 'annotator-overview',
  components: { AnnotatorDatasetCard, AnnotationTutorialBox, CircleSpinner }
})
export default class AnnotatorOverview extends Vue {
  @State((state: RootState) => state.annotator.datasets)
  datasets!: DatasetPayload[]

  @State((state: RootState) => state.team.currentTeam)
  team!: TeamPayload

  @Watch('team')
  onTeam (): void {
    this.loadDatasets()
  }

  mounted (): void {
    this.loadDatasets()
  }

  datasetsLoading: boolean = false

  async loadDatasets (): Promise<void> {
    if (this.datasetsLoading) { return }
    this.datasetsLoading = true
    await this.$store.dispatch('annotator/loadDatasets')
    this.datasetsLoading = false
  }
}
</script>

<style lang="scss" scoped>
.annotator-overview {
  @include col;
  @include fullsize;
  position: absolute;
  overflow: hidden;
}

.annotator-overview__header {
  margin-bottom: 3px;
  margin: 23px 50px 0 50px;
}

.annotator-overview__title {
  @include typography(xxl, mulish, bold);
  color: $color90Black;
}

.annotator-overview__tutorial-box {
  z-index: 1;
  margin: 23px 50px 0 50px;
}

.annotator-overview__datasets {
  flex: 1;
  width: 100%;
  @include col;
  overflow: hidden;

  :deep(.v-loading) {
    width: 100%;
    height: 100%;
    background-color: $colorSecondaryLight3 !important;
  }
}

.annotator-overview__content-placeholder {
  flex: 1;
  @include col--center;
  margin: 23px 50px;
}

.annotator-overview__content-placeholder__image {
  min-height: 177px;
  width: 100%;
  margin-bottom: 25px;

  background-image: url('/static/imgs/no-dataset-background.svg');
  background-position: center;
  background-repeat: no-repeat;
  background-size: contain;
}

.annotator-overview__content-placeholder__text {
  text-align: center;
  @include typography(md-1);
  line-height: 175%;
  color: $colorSecondaryLight;
}

.annotator-overview__content {
  width: 100%;
  padding: 23px 50px 0;
  flex: 1;
  display: grid;
  grid-template-columns: repeat(auto-fit, 300px);
  grid-row-gap: 15px;
  justify-content: space-between;
  margin: 0;
  overflow-y: auto;
}

.annotator-overview__card {
  width: 300px;
  vertical-align: middle;
}
</style>
