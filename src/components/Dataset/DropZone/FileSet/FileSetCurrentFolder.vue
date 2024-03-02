<template>
  <div
    v-if="path"
    class="file-set-current-folder"
  >
    <folder-icon class="folder-icon" />
    <div class="file-set-current-path">
      {{ path }}
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import { FolderIcon } from '@/assets/icons/V1'
import { UploadFileSet } from '@/components/Dataset/DropZone/types'

@Component({
  name: 'file-set-current-folder',
  components: { FolderIcon }
})
export default class FileSetCurrentFolder extends Vue {
  @Prop({ required: true, type: Object as () => UploadFileSet })
  set!: UploadFileSet

  get path (): string | null {
    return this.set.files[0].data.path || null
  }
}
</script>

<style lang="scss" scoped>
.file-set-current-folder {
  @include row;
  align-items: center;

  width: 100%;
  padding: 3px 10px;
}

.folder-icon {
  color: $colorAliceNight;
  margin-right: 7px;
}

.file-set-current-path {
  color: $colorAliceNight;
  @include ellipsis(1, md);
  @include typography(md, inter);
}
</style>
