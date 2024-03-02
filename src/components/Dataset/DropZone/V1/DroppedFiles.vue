<template>
  <div
    v-if="uploadFiles.length > 0"
    class="dropzone__progress"
  >
    <div class="dropzone__progress__header">
      <div class="dropzone__progress__header__name">
        Total files
      </div>
      <div class="dropzone__progress__header__value">
        {{ uploadFiles.length }}
      </div>
    </div>
    <div class="dropzone__progress__sets">
      <FileSet
        v-for="(set, index) in sets"
        :key="index"
        class="dropzone__progress__set"
        :dataset="dataset"
        :set="set"
        :hide-tags="hideTags"
        :hide-folder="hideFolder"
        @remove-set="removeSet(set)"
        @set-folder="setFolder(set, $event)"
        @set-tags="setTags(set, $event)"
      />
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue'

import FileSet from '@/components/Dataset/DropZone/FileSet/FileSet.vue'
import { useDatasetUpload } from '@/composables/useDatasetUpload'
import { useDatasetUploadDropzone } from '@/composables/useDatasetUploadDropZone'
import { DatasetPayload } from '@/store/types'

export default defineComponent({
  name: 'DroppedFiles',
  components: { FileSet },
  props: {
    dataset: { type: Object as () => DatasetPayload, required: true },
    hideTags: { type: Boolean, required: false, default: false },
    hideFolder: { type: Boolean, required: false, default: false }
  }, 
  setup (props, { emit }) {  
    const { sets, uploadFiles } = useDatasetUpload()
    const { removeSet, setFolder, setTags } = useDatasetUploadDropzone(emit)
    
    return {
      removeSet,
      setFolder,
      sets,
      setTags,
      uploadFiles
    }
  }
})
</script>

<style lang="scss" scoped>
.dropzone__progress {
  width: 100%;
  margin-bottom: 25px;

  @include respondFrom(xxl) {
    height: 215px;
  }
}

.dropzone__progress__header {
  @include row;
  align-items: center;
  width: 100%;
  margin-bottom: 20px;
}

.dropzone__progress__header__name {
  margin-right: 10px;
  color: $colorAliceNight;
  @include typography(md, default);
}

.dropzone__progress__header__value {
  color: $color90Black;
  @include typography(md, default, bold);
}

.dropzone__progress__sets {
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-row-gap: 10px;
  grid-column-gap: 10px;
  overflow: auto;
}

.dropzone__progress__set {
  overflow: hidden;
}
</style>
