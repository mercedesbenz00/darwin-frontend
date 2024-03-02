<template>
  <modal
    name="pick-dataset-modal"
    translate="pop-out"
    :min-width="350"
    :max-width="600"
    :width="585 * $theme.getCurrentScale()"
    height="80%"
    :classes="['pick-dataset-modal']"
    :click-to-close="false"
    @opened="onModalOpened"
  >
    <div class="modal__header">
      <p class="modal__header__title">
        <slot name="title" />
      </p>
      <p class="modal__header__text">
        <slot name="description" />
      </p>
      <div
        class="modal__header__close"
        @click="close"
      >
        &#10005;
      </div>
    </div>
    <div class="modal__content">
      <search-field
        ref="searchField"
        v-model="search"
        class="pick-dataset__search"
        placeholder="Search Dataset"
      />
      <label
        v-if="sourceDatasets.length === 0"
        class="pick-dataset__no-dataset"
      >No datasets to show</label>
      <div
        v-else
        class="pick-dataset__datasets"
      >
        <dataset-card
          v-for="dataset in sourceDatasets"
          :id="`dataset-${dataset.id}`"
          :key="dataset.id"
          class="pick-dataset__dataset-card"
          disable-menu
          selectable
          :data="dataset"
          :selected="selectedDataset === dataset"
          @click="$emit('update:selectedDataset', dataset)"
          @dblclick="onDblClick(dataset)"
        />
      </div>
    </div>
    <div class="modal__footer">
      <slot name="actions" />
    </div>
  </modal>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { State } from 'vuex-class'

import SearchField from '@/components/Common/SearchField.vue'
import DatasetCard from '@/components/Dataset/DatasetCard/V1/DatasetCard.vue'
import { DatasetPayload } from '@/store/types'

@Component({
  name: 'pick-dataset-modal',
  components: { DatasetCard, SearchField }
})
export default class PickDatasetModal extends Vue {
  @Prop({ required: true })
  destinationDataset!: DatasetPayload

  @Prop({ default: null })
  selectedDataset!: null | DatasetPayload

  $refs!: {
    searchField: SearchField
  }

  mounted () {
    this.$store.dispatch('dataset/getDatasets')
  }

  search: string = ''

  @State(state => state.dataset.datasets)
  datasets!: DatasetPayload[]

  get sourceDatasets () {
    const searchLowered = this.search.toLowerCase()
    return this.datasets
      .filter(dataset => {
        if (dataset.id === this.destinationDataset.id) { return false }
        return dataset.name.toLowerCase().includes(searchLowered)
      })
  }

  show () {
    this.$modal.show('pick-dataset-modal')
    this.search = ''
  }

  close () {
    this.$modal.hide('pick-dataset-modal')
    this.$emit('close')
  }

  onDblClick (dataset: DatasetPayload) {
    this.$emit('update:selectedDataset', dataset)
    this.$nextTick(() => this.$emit('select'))
  }

  async onModalOpened () {
    await this.$nextTick()
    this.$refs.searchField.setFocus()
  }
}
</script>

<!-- eslint-disable vue-scoped-css/enforce-style-type -->
<style lang="scss">
$headerHeight: 90px;

.pick-dataset-modal {
  position: relative;
  border-radius: 10px;

  .modal__header {
    width: 100%;
    height: $headerHeight;
    padding: 20px 20px 15px;
    justify-content: flex-start;
    background: $colorAliceShade;
  }

  .modal__header__text {
    @include typography(md);
    color: $colorAliceNight;
  }

  .modal__content {
    @include col;
    height: calc(100% - #{$headerHeight});
    overflow: hidden;
    padding: 0;
    background: $colorAliceLight;
  }

  .modal__footer {
    background: $colorAliceBlue;
    box-shadow: 0px -5px 10px rgba(145, 169, 192, 0.1);
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    background: $colorLineGrey;
    column-gap: .8em;

    > * {
      width: 100%;
    }

    > :first-child {
      grid-column: 1;
    }

    > :last-child {
      grid-column: 3;
    }
  }
}
</style>

<style lang="scss" scoped>
.pick-dataset__search {
  height: 35px;
  min-height: 35px;
  margin: 20px 25px 10px;
}

.pick-dataset__datasets {
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  padding: 30px 25px 30px;
  overflow-y: auto;
}

.pick-dataset__no-dataset {
  @include typography(lg, default, bold);
  color: $colorAliceNight;
  margin: 30px 25px 30px;
}

.pick-dataset__dataset-card {
  width: calc(50% - 14px);
  margin-bottom: 20px;

  &:nth-child(even) {
    margin-left: 14px;
  }

  &:nth-child(odd) {
    margin-right: 14px;
  }
}
</style>
