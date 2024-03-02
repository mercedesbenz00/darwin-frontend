<template>
  <div
    v-click-outside="onClickOutside"
    class="tag-applier-input"
  >
    <vue-tags-input
      ref="tagsInput"
      v-model="_tag"
      :tags="currentTags"
      placeholder="Type in a tag"
      avoid-adding-duplicates
      :add-on-blur="false"
      :disabled="disabled"
      @before-adding-tag="onNewTag"
      @before-deleting-tag="onRemoveTag"
    >
      <div
        slot="tag-actions"
        slot-scope="props"
      >
        <template v-if="!disabled">
          <div
            v-if="props.tag.loading"
            class="ti-icon-loading"
          />
          <i
            v-else
            class="ti-icon-close"
            @click="props.performDelete(props.index)"
          />
        </template>
      </div>
    </vue-tags-input>
  </div>
</template>

<script lang="ts">
import VueTagsInput from '@johmun/vue-tags-input'
import { Component, Prop, Vue } from 'vue-property-decorator'

import { AnnotationClassPayload, InputTag } from '@/store/types'

import { AddTagPayload, RemoveTagPayload } from './types'

@Component({
  name: 'tag-applier-input',
  components: { VueTagsInput }
})
export default class TagApplierInput extends Vue {
  @Prop({ required: true })
  currentTags!: InputTag[]

  @Prop({ required: true, type: String })
  tag!: string

  @Prop({ required: false, default: false, type: Boolean })
  disabled!: boolean

  $refs!: {
    tagsInput: InstanceType<typeof VueTagsInput>
  }

  get tagsInputEl (): HTMLInputElement | null {
    if (!this.$refs.tagsInput) { return null }
    const tagsEl = this.$refs.tagsInput.$el as HTMLElement
    return tagsEl.querySelector('input') as HTMLInputElement
  }

  get _tag (): string { return this.tag }
  set _tag (value: string) {
    this.$emit('update:tag', value)
  }

  mounted (): void {
    if (!this.tagsInputEl) { return }
    this.tagsInputEl.addEventListener('keydown', this.onTagsInputKeydown)
    this.$once('hook:beforeDestroy', () => {
      if (!this.tagsInputEl) { return }
      this.tagsInputEl.removeEventListener('keydown', this.onTagsInputKeydown)
    })
  }

  private onTagsInputKeydown (evt: KeyboardEvent): void {
    if (['.', ',', 'Enter'].includes(evt.key)) {
      evt.stopPropagation()
    }
  }

  public setFocus (): void {
    if (!this.tagsInputEl) { return }
    this.tagsInputEl.focus()
  }

  onClickOutside (): void {
    if (!this.tagsInputEl) { return }
    this.tagsInputEl.blur()
  }

  onNewTag (payload: AddTagPayload, specifiedClass?: AnnotationClassPayload): void {
    this.$emit('new-tag', payload, specifiedClass)
  }

  onRemoveTag (payload: RemoveTagPayload): void {
    this.$emit('remove-tag', payload)
  }
}
</script>

<style lang="scss" scoped>
.tag-applier-input {
  margin: 0 10px 10px 10px;
}
</style>

<!-- eslint-disable vue-scoped-css/enforce-style-type -->
<style lang="scss">
.tag-applier-input {
  .vue-tags-input {
    border-radius: $border-radius-default;
    @include typography(md, default);
    background: $colorSecondaryLight3 !important;
    color: $colorSecondaryDark;

    max-height: 200px;
    overflow: auto;

    input::-webkit-input-placeholder {
      color: $colorSecondaryLight;
    }
    input::-moz-placeholder {
      color: $colorSecondaryLight;
    }
    input:-moz-placeholder {
      color: $colorSecondaryLight;
    }
    input:-ms-input-placeholder {
      color: $colorSecondaryLight;
    }
  }

  .ti-input {
    @include typography(md, default);
    padding: 6px 4px !important;
    border: none !important;
    background: $colorSecondaryLight3 !important;
    box-shadow: inset 0px 2px 4px rgba(145, 169, 192, 0.3);
  }

  .ti-new-tag-input {
    background: $colorSecondaryLight3 !important;
  }

  .ti-tag {
    color: $colorSecondaryDark1 !important;
    border-radius: $border-radius-default !important;
    padding: 4px 5px 4px 7px !important;
  }

  .ti-actions {
    .ti-icon-loading {
      background: url('/static/imgs/spinner.svg');
      background-size: 10px 10px;
      width: 10px;
      height: 10px;
      margin-right: -3px; // This is the margin to reduce the right space
      border: none;
      background-repeat: no-repeat;
    }

    i::before {
      color: rgba(0, 0, 0, 0.3);
    }

    i:hover {
      &::before {
        color: $colorSecondaryLight1;
      }
    }
  }
}
</style>
