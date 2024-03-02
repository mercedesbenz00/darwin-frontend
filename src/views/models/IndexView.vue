<template>
  <div class="models">
    <div class="models__header">
      <div class="models__header__title">
        <h1>Your Models</h1>
      </div>
      <div class="models__header__buttons">
        <custom-button
          size="medium"
          flair="rounded"
          tag="a"
          href="https://docs.v7labs.com/docs/bring-your-own-model"
          target="_blank"
          rel="noreferrer noopener"
          variant="default"
        >
          Register External Model
        </custom-button>
        <custom-button
          class="models__new-button"
          color="primary"
          size="medium"
          flair="rounded"
          tag="router-link"
          to="/models/new"
          variant="default"
        >
          Train a Model
        </custom-button>
      </div>
    </div>
    <div class="models__data">
      <model-management />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { State } from 'vuex-class'

import { CustomButton } from '@/components/Common/Button/V2'
import ModelManagement from '@/components/Models/ModelManagement.vue'
import { TrainedModelPayload } from '@/store/types'

@Component({
  name: 'index-view',
  components: {
    CustomButton,
    ModelManagement
  }
})
export default class IndexView extends Vue {
  @State(state => state.neuralModel.selectedTrainedModel)
  deployingTrainedModel!: TrainedModelPayload | null

  cancelDeploy (): void {
    this.$store.commit('neuralModel/SELECT_TRAINED_MODEL', null)
  }
}
</script>

<!-- eslint-disable vue-scoped-css/enforce-style-type -->
<style lang="scss">
.models {
  @include col;
  @include fullsize;
  position: absolute;
  background: $colorSurfaceBackground;
}

.models__header {
  @include row--distributed;
  align-items: flex-end;
  margin-bottom: 3px;
  margin: 23px 50px 0 50px;
}

.models__header__title {
  @include row--distributed--center;
  float: left;

  div {
    height: 100%;
    padding: 1.5px 5px;
    background-color: $colorFeatherLight;
    border-radius: 5px;
    margin-right: 10px;
    color: white;
    font-weight: bold;
  }

  h1 {
    @include typography(xl-1, inter, bold);
    color: $color90Black;
  }
}

.models__header__buttons {
  @include row--distributed;
  gap: 10px;
}

.models__new-button {
  text-transform: none;
}

.models__data {
  @include col;
  padding: 15px 50px;
  overflow: auto;
  margin-top: 5px;
}
</style>
