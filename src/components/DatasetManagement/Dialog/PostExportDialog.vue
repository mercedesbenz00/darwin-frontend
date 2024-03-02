<template>
  <modal-v2
    name="post-export"
    size="medium"
    height="500px"
  >
    <modal-header-v2 @close="close">
      <template #title>
        <modal-header-title-v2>V7's Free Plan</modal-header-title-v2>
      </template>
    </modal-header-v2>
    <modal-content-v2
      v-loading="loading"
      :loading-options="{
        backgroundColor: 'rgba(255,255,255, 0.5)',
        label: null
      }"
    >
      <citation-info
        :dataset="dataset"
      />
    </modal-content-v2>
    <modal-footer-v2 class="footer-container">
      <custom-button
        size="medium"
        @click="accept"
      >
        Accept
      </custom-button>

      <custom-button
        size="medium"
        @click="close"
      >
        Upgrade
      </custom-button>
    </modal-footer-v2>
  </modal-v2>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { Getter, State } from 'vuex-class'

import { CustomButton } from '@/components/Common/Button/V2'
import ModalV2 from '@/components/Common/Modal/V2/Modal.vue'
import ModalContentV2 from '@/components/Common/Modal/V2/ModalContent.vue'
import ModalFooterV2 from '@/components/Common/Modal/V2/ModalFooter.vue'
import ModalHeaderV2 from '@/components/Common/Modal/V2/ModalHeader.vue'
import ModalHeaderTitleV2 from '@/components/Common/Modal/V2/ModalHeaderTitle.vue'
import CitationInfo from '@/components/DatasetManagement/Common/CitationInfo/CitationInfo.vue'
import {
  Dataset,
  DatasetPayload,
  RootState
} from '@/store/types'
/**
 * Used to add additional images to a dataset, from the data tab.
 */

@Component({
  name: 'post-export-dialog',
  components: {
    CitationInfo,
    CustomButton,
    ModalV2,
    ModalContentV2,
    ModalHeaderV2,
    ModalHeaderTitleV2,
    ModalFooterV2
  }
})
export default class PostExportDialog extends Vue {
  @State((state: RootState) => state.dataset.currentDataset)
  currentDataset!: Dataset

  @Getter('findById', { namespace: 'dataset' })
  datasetById!: (id: number) => DatasetPayload | null

  get dataset (): DatasetPayload | null {
    if (!this.currentDataset.id) { return null }
    return this.datasetById(this.currentDataset.id)
  }

  loading: boolean = false

  show (): void {
    this.$modal.show('post-export')
  }

  close (): void {
    this.$modal.hide('post-export')
    this.$store.dispatch('ui/bringFrontSidebar')
  }

  accept (): void {
  }
}
</script>

<style lang="scss" scoped>
.footer-container {
  display: flex;
  justify-content: flex-end;
}
</style>
