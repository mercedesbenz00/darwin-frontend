<template>
  <div class="instructions">
    <div
      v-if="inModal && text"
      class="instructions__html-container"
    >
      <div
        class="instructions__html"
        v-html="text"
      />
    </div>
    <div
      v-if="!inModal"
      class="instructions_header"
    >
      <div class="instructions__description-container">
        <p
          class="instructions__description"
          v-html="text"
        />
        <button
          class="instructions__full-description-link"
          @click="openInstructions"
        >
          Show full instruction
        </button>
      </div>
      <div class="instructions__search">
        <input
          v-model="searchInput"
          placeholder="Search classes…"
          class="instructions__search__input"
          type="search"
          @keydown.stop
          @keypress.stop
          @keyup.stop
        >
        <circle-spinner
          v-if="searchInput"
          aria-label="Loading…"
          class="instructions__loading-indicator"
          :dark="true"
          :width="16"
          :height="16"
        />
      </div>
    </div>
    <div
      class="instructions__list-container"
      :class="{ 'instructions__list-container--small-padding': inModal || !canCreateClass }"
    >
      <div
        v-if="inModal"
        class="instructions__list-header"
      >
        {{ searchAnnotationClasses.length }} Objects to be annotated in this task
      </div>
      <ul class="instructions__list">
        <instructions-list-item
          v-for="(annotationClass) in searchAnnotationClasses"
          :key="annotationClass.id"
          class="instructions__list-item"
          :annotation-class="annotationClass"
          :hotkey="getAnnotationClassHotkey(annotationClass)"
          :is-expanded="expandedAnnotationClassID === annotationClass.id"
          :is-selectable="!inModal"
          @toggle-expand="toggleExpand(annotationClass)"
        />
      </ul>
    </div>
    <div
      v-if="!inModal && canCreateClass"
      class="instructions__list-create"
    >
      <instructions-list-create-item @click="$emit('add-class')" />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import { CircleSpinner } from '@/components/Common/LoadingIndicators'
import { AnnotationClassPayload, AnnotationHotkeysPayload, DatasetPayload } from '@/store/types'
import { getAnnotationClassHotkey, getDatasetHotkeys } from '@/utils'

import InstructionsListCreateItem from './InstructionsListCreateItem.vue'
import InstructionsListItem from './InstructionsListItem.vue'

/**
 * Used to render instructions both in the instructions sidebar, where
 * only a list of classes and a link to show full instructions is shown, as well
 * as in the modal that opens automatically, or when clicking the "Show full
 * instructions" link, where both the classes and the full instructions html
 * are shown.
 */
@Component({
  name: 'instructions',
  components: {
    InstructionsListCreateItem,
    InstructionsListItem,
    CircleSpinner
  }
})
export default class Instructions extends Vue {
  @Prop({ required: true, type: Array })
  annotationClasses!: AnnotationClassPayload[]

  @Prop({ required: true })
  dataset!: DatasetPayload

  get text (): string | null {
    return this.dataset.instructions || null
  }

  // indicates if instructions are being shown in a modal
  // - inModal: true -> full, modal view
  // - inModal: false -> reduced view, for instructions sidebar
  @Prop({ required: false, default: false, type: Boolean })
  inModal!: boolean

  openInstructions (): void {
    this.$ga.event('workview', 'show_full_instructions', 'manually')
    this.$store.commit('workview/OPEN_INSTRUCTIONS')
  }

  searchInput: string = ''
  expandedAnnotationClassID: number | null = null

  get canCreateClass (): boolean {
    return this.$can('create_annotation_class')
  }

  get searchAnnotationClasses (): AnnotationClassPayload[] {
    return this.annotationClasses.filter(c =>
      c.name.toLowerCase().indexOf(this.searchInput.toLowerCase().trim()) !== -1
    )
  }

  /**
   * A class can have a hotkey of it's own. If it does not, we give it a free one
   * auto-assigned based on class order in workview.
   */
  get datasetHotkeys (): AnnotationHotkeysPayload {
    return getDatasetHotkeys({
      annotationClasses: this.annotationClasses,
      dataset: this.dataset
    })
  }

  /**
   * Resolves a list of hotkeys where each class is ensured to be given a 0..9
   * hotkey, if available.
   *
   * - A class with a hotkey explicitly set will use that
   * - A class without a hotkey will be given the first free one
   */
  getAnnotationClassHotkey (annotationClass: AnnotationClassPayload): string | null {
    const { datasetHotkeys } = this
    const matchingHotkey = getAnnotationClassHotkey(datasetHotkeys, annotationClass.id)
    return matchingHotkey || null
  }

  toggleExpand (annotationClass: AnnotationClassPayload): void {
    if (this.expandedAnnotationClassID === annotationClass.id) {
      this.expandedAnnotationClassID = null
    } else {
      this.expandedAnnotationClassID = annotationClass.id
    }
  }

  reset (): void {
    this.searchInput = ''
  }
}
</script>

<!-- eslint-disable vue-scoped-css/enforce-style-type -->
<style lang="scss">
.instructions {
  @include typography(md, default);
  @include col;
  width: 100%;
  overflow: hidden;
}

.instructions__list-container {
  overflow: auto;
  padding: 20px 20px 5px;
}

.instructions__list-container--small-padding {
  padding-bottom: 20px;
}

.instructions__list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.instructions__list-item:not(:last-child) {
  margin-bottom: 8px;
}

.instructions__description-container {
  padding: 10px 20px;
  border-bottom: 1px solid rgba($colorGrayLiter, 1);
}

.instructions__description {
  @include ellipsis(2, md-1);
  color: $colorSecondaryLight;
}

.instructions__full-description-link {
  color: $colorSecondaryLight;
  font-weight: bold;
  text-decoration: underline;

  &:hover {
    text-decoration: none;
  }
}

.instructions__search {
  position: relative;
  padding: 10px 20px;
  border-bottom: 1px solid rgba($colorGrayLiter, 1);

  &:before {
    content: '';
    background-image: url(./assets/search.svg);
    background-repeat: no-repeat;
    background-size: contain;
    background-position-y: 22%;
    position: absolute;
    height: 100%;
    width: 12px;
    left: 30px;
    display: block;
  }

  .instructions__loading-indicator {
    position: absolute;
    right: 26px;
    top: 17px;

    .sk-fading-circle {
      margin: 0;
    }
  }
}

.instructions__search__input {
  border-radius: 5px;
  padding: 6px 40px 6px 30px;
  width: 100%;

  &::placeholder {
    color: $colorGrayLite;
  }
}

.instructions__loading-indicator {
  display: inline-block;
}

.instructions__list-header {
  text-align: center;
  padding-bottom: 20px;
  @include typography(md-1, headlines, bold);
  color: $colorSecondaryDark1;
}

.modal__instructions {
  .modal__header {
    @include paddingLR(25px);
    flex: 0 0 auto;
  }

  .v--modal {
    /*overflow: auto;*/
    background: $colorGriteDark;
    display: flex;
    flex-direction: column;
  }

  .instructions-scroll-container {
    flex: 1 1 auto;
  }
}

.instructions__html-container {
  position: relative;
  padding: 25px;
  text-align: center;
}

.instructions__html {
  background-color: $colorWhite;
  padding: 25px;
  text-align: left;
  @include typography(md-1);
  box-shadow: $shadowS;
  border-radius: 10px;
  color: $colorSecondaryDark1;

  & > ul,
  & > ol {
    padding-left: 18px;
  }

  strong,
  b {
    font-weight: bold;
    font-family: $fontFamilyHeadlines;
  }

  em {
    font-style: italic;
  }

  video, iframe {
    max-width: 100%;
  }

  // When emoticons are added by froala editor,
  // we need to override their styles.
  .fr-emoticon {
    background-repeat: no-repeat !important;
    min-width: 18px;
    min-height: 18px;
    display: inline-block;
  }
}

.instructions-scroll-container {
  overflow-y: auto;
}

</style>
