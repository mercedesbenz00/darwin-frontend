<template>
  <div class="upload-commands">
    <div class="upload-commands__title">
      Command Line Upload
    </div>
    <div class="upload-commands__tips">
      Recommended for batches of over 2,000 images
    </div>
    <div class="upload-commands__main">
      <upload-command
        class="upload-commands__command"
        :data="commands[0]"
      />
      <a
        class="upload-commands__docs"
        href="https://v7labs.github.io/darwin-py"
        target="_blank"
      >
        Docs
      </a>
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
import { Component, Prop, Vue } from 'vue-property-decorator'
import { State } from 'vuex-class'

import { TeamPayload, DatasetPayload } from '@/store/types'

import UploadCommand from './UploadCommand.vue'

@Component({
  name: 'upload-commands',
  components: { UploadCommand }
})
export default class UploadCommands extends Vue {
  @Prop({ required: true, type: Object })
  dataset!: DatasetPayload

  @State(state => state.team.currentTeam)
  currentTeam!: TeamPayload

  expanded: boolean = false

  get commands (): { command: string, label: string }[] {
    const { currentTeam, dataset } = this
    const prefix = `darwin dataset push ${currentTeam.slug}/${dataset.slug}`
    return [
      { command: `${prefix} /path/to/images`, label: 'Image upload via CLI' },
      {
        command: `${prefix} -p folder_with_images_and_folders`, label: 'To include multiple folders'
      },
      { command: `${prefix} --fps 2 video1.mp4 video2.mp4`, label: 'To upload video' }
    ]
  }
}
</script>

<style lang="scss" scoped>
.upload-commands {
  @include col;
}

.upload-commands__title {
  @include typography(lg, default, bold);
  margin-bottom: 5px;
  color: $color90Black;
}

.upload-commands__tips {
  @include typography(md-1);
  margin-bottom: 15px;
  color: $color90Black;
}

.upload-commands__main {
  @include row;
  align-items: flex-end;
  margin-bottom: 15px;
}

.upload-commands__command {
  flex: 1;
  border-radius: 3px;
  overflow: hidden;
  @include ellipsis(1, md);
  @include typography(md);
}

.upload-commands__docs {
  @include row--center;
  height: 100%;
  @include typography(md-1, default, bold);
  padding: 5px;
  margin-left: 10px;
  color: $color90Black;
  border: 1px solid $color90Black;
  border-radius: 2px;
}

.upload-commands__extras {
  @include col;
}

.upload-commands__command--extra:not(:last-child) {
  margin-bottom: 15px;
}
</style>
