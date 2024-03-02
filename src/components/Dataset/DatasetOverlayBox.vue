<template>
  <div
    v-if="currentUser"
    class="dataset-overlay-box"
  >
    <billing-box />
    <annotation-tutorial-box />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { State } from 'vuex-class'

import AnnotationTutorialBox from '@/components/AnnotationTutorialBox/AnnotationTutorialBox.vue'
import BillingBox from '@/components/Dataset/BillingBox.vue'
import { RootState, UserPayload } from '@/store/types'

@Component({
  name: 'dataset-overlay-box',
  components: { AnnotationTutorialBox, BillingBox }
})
export default class DatasetOverlayBox extends Vue {
  @State((state: RootState) => state.user.profile)
  currentUser!: UserPayload
}
</script>

<style lang="scss" scoped>
.dataset-overlay-box {
  @include row;
  z-index: var(--z-index-dataset-overlay);

  & > div {
    flex: 1;

    &:not(:last-child) {
      margin-right: 28px;
    }
  }
}
</style>
