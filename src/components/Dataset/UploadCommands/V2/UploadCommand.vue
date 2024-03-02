<template>
  <div class="upload-command">
    <label class="upload-command__label">{{ label }}</label>
    <div
      class="upload-command__command"
      @click="onClick"
    >
      <span class="upload-command__prefix">$&nbsp;darwin</span>&nbsp;{{ prefix }} {{ command }}

      <icon-mono-copy class="upload-command__icon" />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { State, Getter } from 'vuex-class'

import { IconMonoCopy } from '@/assets/icons/V2/Mono'
import { Dataset, DatasetPayload, RootState, TeamPayload } from '@/store/types'
import { copy as copyToClipboard } from '@/utils'

@Component({
  name: 'upload-command',
  components: {
    IconMonoCopy
  }
})
export default class UploadCommand extends Vue {
  @Prop({ required: true })
  data!: { command: string, label: string }

  @State((state: RootState) => state.dataset.currentDataset)
  currentDataset!: Dataset

  @Getter('findById', { namespace: 'dataset' })
  datasetById!: (id: number) => DatasetPayload | null

  @State(state => state.team.currentTeam)
  currentTeam!: TeamPayload

  get dataset (): DatasetPayload | null {
    if (!this.currentDataset.id) { return null }
    return this.datasetById(this.currentDataset.id)
  }

  get prefix (): string {
    const { currentTeam, dataset } = this
    if (!dataset) { return '' }
    return `dataset push ${currentTeam.slug}/${dataset.slug}`
  }

  get command (): string {
    return this.data.command
  }

  get label (): string {
    return this.data.label
  }

  async onClick (): Promise<void> {
    try {
      await copyToClipboard(`darwin ${this.prefix} ${this.command}`)
    } catch (e: unknown) {
      const warning =
        "Couldn't copy content to clipboard. Please select the text and copy it manually."
      this.$store.dispatch('toast/warning', { content: warning })
      return
    }

    const notification = 'Command copied to clipboard'
    this.$store.dispatch('toast/notify', { content: notification })
  }
}
</script>

<style lang="scss" scoped>
.upload-command {
  @include col;

  &__label {
    margin-bottom: 4px;
    color: $colorContentSecondary;
    @include typography(md, inter);
  }

  &__command {
    @include typography(md, inter);
    position: relative;
    color: $colorContentEmphasis;
    background: $colorSurfaceRaise;
    padding: 7px 10px;
    padding-right: 35px;
    cursor: pointer;
    border-radius: 8px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    transition: background .3s;

    &:hover {
      background: $colorInteractiveSecondaryHover;
    }
  }

  &__prefix {
    color: $colorInteractivePrimaryDefault;
  }

  &__icon {
    position: absolute;
    top: 50%;
    right: 10px;
    transform: translateY(-50%);
    width: 20px;
    height: 20px;
  }
}
</style>
