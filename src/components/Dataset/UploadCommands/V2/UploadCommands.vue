<template>
  <div class="upload-commands">
    <h3 class="upload-commands__title">
      Command Line Upload
    </h3>
    <p class="upload-commands__tips">
      Recommended for batches of over 2,000 images
    </p>
    <div class="upload-commands__main">
      <upload-command
        class="upload-commands__command"
        :data="commands[0]"
      />
      <custom-button
        class="upload-commands__docs-btn"
        size="very-small"
        tag="a"
        href="https://docs.v7labs.com/reference/upload-files"
        target="_blank"
        flair="rounded"
      >
        Docs
      </custom-button>
    </div>

    <div class="upload-commands__extras">
      <upload-command
        v-for="(command, index) of commands.slice(1)"
        :key="index"
        class="upload-commands__command upload-commands__command--extra"
        :data="command"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { State, Getter } from 'vuex-class'

import { CustomButton } from '@/components/Common/Button/V2'
import { Dataset, DatasetPayload, RootState, TeamPayload } from '@/store/types'

import UploadCommand from './UploadCommand.vue'

@Component({
  name: 'upload-commands',
  components: {
    UploadCommand,
    CustomButton
  }
})
export default class UploadCommands extends Vue {
  @State((state: RootState) => state.dataset.currentDataset)
  currentDataset!: Dataset

  @Getter('findById', { namespace: 'dataset' })
  datasetById!: (id: number) => DatasetPayload | null

  get dataset (): DatasetPayload | null {
    if (!this.currentDataset.id) { return null }
    return this.datasetById(this.currentDataset.id)
  }

  @State(state => state.team.currentTeam)
  currentTeam!: TeamPayload

  expanded: boolean = false

  get commands (): { command: string, label: string }[] {
    return [
      { command: '/path/to/images', label: 'Image upload via CLI' },
      { command: '-p folder_with_images_and_folders', label: 'To include multiple folders' },
      { command: '--fps 2 video1.mp4 video2.mp4', label: 'To upload video' }
    ]
  }
}
</script>

<style lang="scss" scoped>
.upload-commands {
  @include col;
  background-color: $colorSurfaceElevate;
  border-radius: 8px;
  padding: 16px;

  &__title {
    @include typography(lg, inter);
    color: $colorContentEmphasis;
  }

  &__tips {
    @include typography(lg, inter);
    margin-bottom: 15px;
    color: $colorContentSecondary;
  }

  &__main {
    @include row;
    align-items: flex-end;
    margin-bottom: 15px;
  }

  &__command {
    flex: 1;
    border-radius: 3px;
    overflow: hidden;
    @include ellipsis(1, md);
  }

  &__docs-btn {
    margin-left: 4px;
    color: $colorContentEmphasis !important;
    background: $colorSurfaceRaise !important;
    padding: 2px 20px !important;
    height: auto;
    transition: background .3s;

    &:hover {
      background: $colorInteractiveSecondaryHover !important;
    }
  }

  &__extras {
    @include col;
  }

  &__command--extra:not(:last-child) {
    margin-bottom: 15px;
  }
}
</style>
