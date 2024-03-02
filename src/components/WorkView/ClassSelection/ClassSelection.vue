<template>
  <modal
    class="modal__class-selection"
    name="modalClassSelection"
    :adaptive="true"
    :height="'80%'"
    :max-height="800"
    :min-height="400"
    @opened="focusSearch"
    @closed="close"
  >
    <div class="modal__header">
      <button
        class="modal__close-button"
        aria-label="close"
        @click="close"
      />
      <strong>Select class</strong>
      <p>Please select the class of the new layer</p>
    </div>
    <div class="class-selection">
      <div class="class-selection__search">
        <input
          ref="searchInputField"
          v-model="searchInput"
          placeholder="Search"
          class="class-selection__search__input"
          type="search"
          autofocus
          @keydown.stop
          @keypress.stop
          @keyup.stop
        >
        <circle-spinner
          v-if="searchInput && isLoading"
          aria-label="Loading…"
          class="class-selection__loading-indicator"
          :dark="true"
          :width="16"
          :height="16"
        />
      </div>
      <div class="class-selection__scroll-container">
        <div class="class-selection__list-wrapper">
          <div class="class-selection__list">
            <template v-if="alphabet.length">
              <div
                v-for="character in alphabet"
                :key="character"
              >
                <div class="class-selection__list__index">
                  {{ character }}
                </div>
                <ul class="class-selection__list__sublist">
                  <li
                    v-for="annotationClass in classes[character]"
                    :key="annotationClass.name"
                    class="class-selection__list-item"
                  >
                    <class-item
                      :annotation-class="annotationClass"
                      :selected-class="selectedClass"
                      @select="selectClass"
                      @save="selectAndSave"
                    />
                  </li>
                </ul>
              </div>
            </template>
            <div
              v-else
              class="class-selection__no-results"
            >
              Nope, your search query does not match anything. 💁
            </div>
          </div>
        </div>
      </div>
      <div class="class-selection__submit-bar">
        <secondary-button
          v-if="canCreateClass"
          class="class-selection__add"
          :disabled="!dataset"
          @click.prevent="$emit('add-class')"
        >
          Add new class
        </secondary-button>
        <positive-button
          class="class-selection__save"
          :disabled="selectedClass ? false : 'disabled'"
          @click.prevent="save"
        >
          Save
        </positive-button>
      </div>
    </div>
  </modal>
</template>

<script lang="ts">
import { nextTick } from 'process'

import { groupBy } from 'lodash'
import { computed, defineComponent, ref, watch } from 'vue'

import { CircleSpinner } from '@/components/Common/LoadingIndicators'
import ClassItem from '@/components/WorkView/ClassSelection/ClassItem.vue'
import { useAuth } from '@/composables/useAuth'
import { useModal } from '@/composables/useModal'
import { useStore } from '@/composables/useStore'
import { Editor } from '@/engine/editor'
import { AnnotationClass } from '@/engineCommon/AnnotationClass'
import { LoadingStatus } from '@/store/types'
import { getDatasetClasses } from '@/utils'

/**
 * Handles class selection when attempting to draw annotations on the canvas
 *
 * When a user tries to draw an annotation without a class preselected,
 * this dialog pops up so user can select a class.
 */
export default defineComponent({
  name: 'ClassSelection', 
  components: { ClassItem, CircleSpinner } ,
  props: {
    editor: { type: Object as () => Editor, required: true }
  },
  setup (props) {
    const store = useStore()
    const dataset = computed(() => store.state.workview.dataset)
    const searchInputField = ref<HTMLInputElement | null>(null)
    const modal = useModal()

    const setDialogVisibility = (isVisible: boolean): void => {
      if (isVisible) {
        props.editor.deactivateCallbacks()
        modal.show('modalClassSelection')
      } else {
        props.editor.activateCallbacks()
        modal.hide('modalClassSelection')
      }
    }

    watch(() => props.editor.classDialog.showClassSelection, (isVisible) => {
      setDialogVisibility(isVisible)
    })
    
    const searchInput = ref('')
    const selectedClass = ref<AnnotationClass | null>(null)
    const selectedAttributes = ref<string[]>([])

    const allClasses = computed(() => props.editor.activeView.annotationClasses)
    const datasetClasses = computed(() => {
      if (!dataset.value) { return [] }
      return getDatasetClasses<AnnotationClass>(allClasses.value, dataset.value.id)
    })

    /**
     * Annotation type the currently selected tool is associated with
     *
     * This determines which classes will be available for selection.
     */
    const annotationType = computed(() => props.editor.classDialog.annotationType)
 
    const classesForTool = computed(() => {
      if (!annotationType.value) { return datasetClasses.value }
      return datasetClasses.value.filter(
        c => annotationType.value && c.annotation_types.includes(annotationType.value)
      )
    })

    const searchAnnotationClasses = computed(() => {
      if (!searchInput.value) { return classesForTool.value }
      return classesForTool.value.filter(c =>
        c.name.toLowerCase().indexOf(searchInput.value.toLowerCase().trim()) !== -1
      )
    })

    const classes = computed(
      () => groupBy<AnnotationClass>(searchAnnotationClasses.value, (c) => c.name[0])
    )

    const alphabet = computed(() => Object.keys(classes.value).sort())

    const previousClassId = computed(() => props.editor.classDialog.previousClassID)

    watch(() => previousClassId.value, (previousClassId) => {
      if (previousClassId === null) { return }
      const match = datasetClasses.value.find(entry => entry.id === previousClassId)
      if (match) { selectedClass.value = match }
    }, { immediate: true })

    watch(() => searchInput.value, () => {
      selectedClass.value = null
    })

    const selectClass = (annotationClass: AnnotationClass): void => {
      selectedClass.value = annotationClass
    }

    const save = (): void => {
      if (!selectedClass.value) { throw new Error('No class selected in class selection dialog') }
      props.editor.classDialog.selectAnnotationClass(selectedClass.value)
    }
    
    const selectAndSave = (annotationClass: AnnotationClass): void => {
      selectClass(annotationClass)
      save()
    }

    const focusSearch = (): void => {
      nextTick(() => {
        if(!searchInputField.value) { return }
        searchInputField.value.focus()
      })
    }

    const close = (): void => props.editor.classDialog.cancel()

    const { isAuthorized } = useAuth()
    const canCreateClass = computed<boolean>(() => isAuthorized('create_annotation_class'))

    const isLoading = computed<boolean>(
      () => store.state.aclass.classesLoadingStatus !== LoadingStatus.Loaded
    )

    return { 
      alphabet,
      allClasses,
      datasetClasses,
      canCreateClass,
      classes,
      close,
      dataset,
      focusSearch,
      isLoading,
      save,
      searchInput, 
      searchInputField,
      selectClass,
      selectedClass,
      selectAndSave,
      selectedAttributes
    }
  }
})
</script>

<!-- eslint-disable vue-scoped-css/enforce-style-type -->
<style lang="scss">
$searchHeight: 60px;

.modal__class-selection {
  .v--modal {
    @include col;
    background-color: $colorGriteDark;
  }

  .modal__header {
    padding-bottom: 80px;
  }

  .class-selection__loading-indicator {
    .sk-fading-circle {
      margin: 0;
    }
  }
}

.class-selection__loading-indicator {
  position: absolute;
  right: 46px;
  top: 22px;
}

.class-selection {
  border-radius: 10px;
  overflow: hidden;
  @include col;
  flex: 1;
  margin-top: -30px;
}

.class-selection__search {
  @include paddingLR(30px);
  width: 100%;
  position: relative;
  height: $searchHeight;
  flex: 0 1 auto;
  margin-bottom: -30px;
  z-index: 1;

  &:before {
    content: '';
    background-image: url(./assets/search.svg);
    background-repeat: no-repeat;
    background-size: contain;
    background-position-y: 50%;
    position: absolute;
    height: 100%;
    width: 20px;
    left: 45px;
    display: block;
  }
}

.class-selection__search__input {
  box-shadow: $shadowS;
  background-color: $colorWhite;
  width: 100%;
  display: block;
  height: 100%;
  padding: 0 20px 0 50px;
  border-radius: 5px;
  appearance: none;

  &::placeholder {
    color: $colorGrayLite;
  }
}

.class-selection__scroll-container {
  height: calc(100% - #{$searchHeight});
  overflow: auto;
  flex: 1 1 auto;
  padding-bottom: 20px;
}

.class-selection__list-wrapper {
  @include marginLR(auto);
  padding: 40px 0 20px;
  width: calc(100% - 40px);
  height: 100%;
  position: relative;
}

.class-selection__list__sublist {
  list-style: none;
  margin: 0;
  padding: 0;
}

.class-selection__list-item {
  position: relative;
  max-width: 260px;
  min-width: calc(50% - 20px);
  width: calc(100% - 20px);
  float: left;
  margin: 10px;
}

.class-selection__list__index {
  clear: left;
  padding-top: 20px;
  margin: 0 10px;
  text-transform: uppercase;
  color: $colorGrayLite;
}

.class-selection__submit-bar {
  @include row;
  align-items: center;
  box-shadow: $shadowS;
  padding: 10px 20px;
  background-color: $colorWhite;
  position: relative;
  z-index: 1;
  text-align: right;
  font-size: 0;
}

.class-selection__add,
.class-selection__save {
  flex: 1;
  min-width: 170px;
  &:not(:last-child) {
    margin-right: 24px;
  }
}

.class-selection__no-results {
  padding: 10px;
  text-align: center;
}

.modal__checkboxes {
  @include row;
  flex-wrap: wrap;
  justify-content: left;
  overflow: scroll;

  height: 85px;
  text-align: left;

  .element {
    height: 25px;
    margin: 10px 10px;
    display: block;
  }
  input {
    height: 25px;
  }
  label {
    @include ellipsis(1);
  }
  .text {
    margin: 3px 15px;
    @include typography(lg-1, default);
    color: #000;
  }
}

</style>
