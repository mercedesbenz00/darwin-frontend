<template>
  <div
    role="button"
    class="dataset"
    :class="{'dataset--selected': isSelected}"
    @click="setSelectedDataset"
  >
    <h4 class="dataset__title">
      {{ dataset.name }}
    </h4>
    <div class="dataset__counts">
      <div class="count">
        <div class="count__value">
          {{ fileCount }}
        </div>
        <div class="count__name">
          Files
        </div>
      </div>
      <div class="count">
        <div class="count__value">
          {{ classCount }}
        </div>
        <div class="count__name">
          Classes
        </div>
      </div>
      <div class="count">
        <div class="count__value">
          {{ annotationCount }}
        </div>
        <div class="count__name">
          Anno
        </div>
      </div>
    </div>
    <div class="dataset__ratio" />
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { State } from 'vuex-class'

import { DatasetPayload } from '@/store/types'

@Component({ name: 'dataset-card' })
export default class DatasetCard extends Vue {
  @Prop({ required: true, type: Object as () => DatasetPayload })
  dataset!: DatasetPayload

  get fileCount (): number {
    return this.imageCount + this.videoCount
  }

  get imageCount (): number {
    return this.dataset.num_images || 0
  }

  get videoCount (): number {
    return this.dataset.num_videos || 0
  }

  get classCount (): number {
    return this.dataset.num_classes || 0
  }

  get annotationCount (): number {
    return this.dataset.num_annotations || 0
  }

  @State(state => state.neuralModel.newModelDataset)
  selectedDataset!: DatasetPayload | null

  get isSelected (): boolean {
    const { dataset, selectedDataset } = this
    return !!selectedDataset && selectedDataset.id === dataset.id
  }

  setSelectedDataset (): void {
    this.$store.commit('neuralModel/SET_NEW_MODEL_DATASET', this.dataset)
  }
}
</script>

<style lang="scss" scoped>
.dataset {
  border-radius: 5px;
  background: $colorAliceShade;

  transition: all .2s ease;
  transition-property: background-color, border-color;

  display: grid;
  grid-template-rows: auto auto 5px;
  box-sizing: border-box;
  border: 2px solid transparent;
  background-clip: padding-box;

  cursor: pointer;
}

.dataset:hover {
  background-color: $colorAliceShadow;
}
.dataset--selected {
  border: 2px solid $colorAliceNight;
}

.dataset__title {
  @include typography(md-1, Mulish, bold);
  padding: 11px 11px 0 11px;
}

.dataset__counts {
  @include typography(sm, Mulish, bold);
  padding: 11px;

  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  justify-items: center;
}

.dataset__ratio {
  background: $colorFeatherLight;
  border-radius: 0 0 5px 5px;
}

.count {
  display: grid;
  grid-template-columns: auto auto;
  column-gap: 2px;
  @include typography(sm, Mulish, bold);
}

.count__value {
  justify-self: end;
}

.count__name {
  justify-self: start;
  color: $colorAliceNight;
}

</style>
