<template>
  <div class="file-set-info">
    <div class="file-set__progress">
      <vue-circle
        ref="progressIndicator"
        :progress="progress"
        :size="40 * $theme.getCurrentScale()"
        :reverse="false"
        line-cap="round"
        empty-fill="rgba(204, 244, 240, 1)"
        :fill="{ color: '#31F5CA' }"
        :start-angle="-1.57"
        insert-mode="append"
        :thickness="5"
        :show-percent="false"
      />
    </div>
    <div class="file-set__texts">
      <div class="file-set__name-container">
        <label class="file-set__name">{{ name }}</label>
      </div>
      <div class="file-set__others">
        <span class="file-set__count">
          {{ imageCount | pluralize('File', 'Files') }}
        </span>

        <div class="file-set__actions">
          <slot name="actions" />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
import VueCircle from 'vue2-circle-progress'
import { Getter } from 'vuex-class'

import { UploadFileSet } from '@/components/Dataset/DropZone/types'
import { UploadFile } from '@/store/modules/datasetUpload/types'

@Component({
  name: 'file-set-info',
  components: { VueCircle }
})
export default class FileSetInfo extends Vue {
  @Prop({ required: true, type: Object as () => UploadFileSet })
  set!: UploadFileSet

  @Getter('uploadProgressForFiles', { namespace: 'datasetUpload' })
  progressForSet!: (uploadFiles: UploadFile[]) => number

  @Getter('imageCount', { namespace: 'datasetUpload' })
  fileImageCount!: (uploadFile: UploadFile) => number

  $refs!: {
    progressIndicator?: Vue & {
      updateProgress: (progress: number) => void
    }
  }

  /**
   * Used to show progress on the progress indicator
   */
  get progress (): number {
    return this.progressForSet(this.set.files)
  }

  /**
   * Rendered as name for the set
   */
  get name (): string {
    return (this.set.files.length === 1)
      ? this.set.files[0].file.name
      : `Set ${this.set.id}`
  }

  /**
   * Used to show total number of images within the set
   */
  get imageCount (): number {
    return this.set.files.reduce((acc, u) => acc + this.fileImageCount(u), 0)
  }

  /**
   * The vue2-circle-progress component does not update automatically, so we are
   * forced to watch the computed and call an update function manually.
   *
   * TODO: Figure out why this is the case and if there's an alternative
   */
  @Watch('progress')
  onProgress (progress: number): void {
    const progressIndicator = this.$refs.progressIndicator
    if (!progressIndicator) { return }
    progressIndicator.updateProgress(progress)
  }
}
</script>

<style lang="scss" scoped>
.file-set-info {
  @include row;
  align-items: center;
  height: 70px;
  padding: 3px 10px;
}

.file-set__progress {
  @include row--center;
  width: 40px;
  height: 40px;
}

.file-set__texts {
  @include col--distributed;
  flex: 1;
  height: 100%;
  margin-left: 5px;
}

.file-set__name-container {
  @include row;
  flex: 1 1 auto;
}

.file-set__name {
  @include ellipsis(2, md);
  @include typography(md, inter);
  color: $colorSecondaryDark1;
  margin-bottom: 0;
}

.file-set__others {
  @include row;
  align-items: center;
  margin-bottom: 0;
}

.file-set__count {
  flex: 1;
  @include typography(md, inter);
  line-height: 18px;
  color: $colorSecondaryLight;
}

.file-set__actions {
  @include row;
  align-items: center;

  & > *:not(:last-child) {
    margin-right: 5px;
  }
}
</style>
