<template>
  <draggable-resizable
    initial-height="40%"
    :min-height="130"
    max-height="60%"
    :parent-height="parentHeight"
  >
    <div
      class="tag-applier"
    >
      <tag-applier-header
        :direction="direction"
        :disabled="disabled"
        @change:direction="direction = $event"
      />
      <div
        class="tag-applier__resizables"
        :class="{ 'tag-applier__resizables--create': showCreateButton }"
      >
        <tag-applier-list
          v-if="!disabled"
          ref="tagApplierList"
          :keyword="keyword"
          :items="availableBadges"
          :direction="direction"
          :duplicate="alreadyAdded"
          @create="onCreateTag"
        />
        <div v-else /> <!-- keep the input aligned to the bottom when adding tags is disabled -->
        <tag-applier-input
          ref="tagApplierInput"
          :keyword="keyword"
          :items="inputBadges"
          :disabled="disabled"
          :can-create="canCreateTags"
          @change="onChange"
          @create="onCreateTag"
          @delete="onDeleteTag"
          @focus:list="onFocusList"
        />
      </div>
      <tag-applier-create
        v-if="showCreateButton"
        :keyword="keyword"
        :add="alreadyExists"
        @create="onCreateTag"
      />
    </div>
  </draggable-resizable>
</template>

<script lang="ts">
import {
  defineComponent,
  computed,
  nextTick,
  ref,
  Ref,
  watch
} from 'vue'

import { BadgeType } from '@/components/Common/Badge'
import { DraggableResizable } from '@/components/Common/DraggableResizable'
import { matchClassByName } from '@/components/Common/TagApplier/utils'
import {
  TagApplierCreate,
  TagApplierHeader,
  TagApplierInput,
  TagApplierList
} from '@/components/WorkView/TagApplier/Common'
import {
  classesToBadges,
  filterAvailableBadges,
  inputTagsToBadges,
  toTagItem,
  initializeTag
} from '@/components/WorkView/TagApplier/utils'
import { useAuth, useScroll, useSetFocus, useStore } from '@/composables'
import { Editor } from '@/engine/editor'
import { Annotation } from '@/engine/models'
import {
  createAnnotationClass as createAnnotationClassType
} from '@/store/modules/aclass/actions/createAnnotationClass'
import {
  AnnotationClassPayload,
  DatasetPayload,
  InputTag,
  StoreActionPayload,
  TeamPayload,
  UserPayload
} from '@/store/types'
import { getDatasetClasses, getAutoAnnotationClassColor } from '@/utils'

/**
 * TagApplier
 *
 * Creates a new tag annotation on the current selected imagecreate
 * from the existing annotation class or newly created annotation class.
 *
 * In annotation mode, it would be enabled.
 *
 * In review mode, it would be disabled.
 *
 * Manage the tag annotation classes and assigned tag annotations for the selected image
 *
 * @param disabled Boolean value to represent whether the component is disabled or not
 * @param editor The current editor instance
 */
export default defineComponent({
  name: 'TagApplier',
  components: {
    DraggableResizable,
    TagApplierCreate,
    TagApplierHeader,
    TagApplierInput,
    TagApplierList
  },
  props: {
    editor: { required: true, type: Object as () => Editor },
    disabled: { type: Boolean, default: false },
    parentHeight: { type: Number, default: 0 }
  },
  setup (props) {
    const { state, dispatch } = useStore()
    const { isAuthorized } = useAuth()
    const { setFocus } = useSetFocus()
    const { scrollRefToBottom } = useScroll()

    const tagApplierList = ref<HTMLDivElement>()
    const tagApplierInput = ref<HTMLDivElement>()
    const keyword: Ref<string> = ref('')
    const focused: Ref<boolean> = ref(false)
    const direction: Ref<'asc' | 'desc'> = ref('asc')
    /**
     * The vue tags input component requires a special structure of it's elements.
     *
     * This list holds that structure and is updated every time the list of currently applied tags
     * in the editor changes.
     */
    const tags: Ref<InputTag[]> = ref([])

    const user = computed((): UserPayload | null => state.user.profile)

    const videoAnnotationDuration = computed((): number => state.workview.videoAnnotationDuration)

    const currentTeam = computed((): TeamPayload | null => state.team.currentTeam)

    const dataset = computed((): DatasetPayload | null => state.workview.dataset)

    const allClasses = computed((): AnnotationClassPayload[] => state.aclass.classes)

    const canCreateTags = computed((): boolean => {
      return isAuthorized('create_annotation_class',
        { subject: 'dataset', resource: dataset.value },
        ['workforce_manager', 'member', 'admin', 'owner']
      )
    })

    const datasetTags = computed((): AnnotationClassPayload[] => {
      const allTags = (allClasses.value || [])
        .filter(c => c.annotation_types.includes('tag'))
      return getDatasetClasses(allTags, dataset.value?.id || 0)
    })

    /**
     * In case of videos, even though a tag might be applied to the video as a whole, we have to
     * check which frame segments it's applied to.
     *
     * This getter returns all tags if the item is not a video, but only those applicable to the
     * current frame segment if it is a video.
     */
    const currentTags = computed((): InputTag[] => {
      const { activeView } = props.editor

      if (activeView.loadedVideo) {
        return (tags.value || [])
          .filter((tag: InputTag) => !tag.segments || (tag.segments || [])
            .some(range =>
              // assumes segment second is `null` it's should be full video wide
              activeView.currentFrameIndex >= range[0] && 
              (range[1] === null || activeView.currentFrameIndex < range[1])
            )
          )
      }
      return tags.value
    })

    /**
     * Get all tags in a badge format, filtering by the input keyword and
     * removing the ones already in usage and
     */
    const availableBadges = computed((): BadgeType[] => {
      const badges = classesToBadges(datasetTags.value || [])
      return filterAvailableBadges(badges, currentTags.value, keyword.value)
    })

    const inputBadges = computed((): BadgeType[] => {
      return inputTagsToBadges(currentTags.value)
    })

    /**
     * Lists all tag annotations applied to the current dataset item
     */
    const tagAnnotations = computed((): Annotation[] => {
      return props.editor.activeView.annotations.filter(a => a.type === 'tag')
    })

    /**
     * Check if keyword already exists as an annotation class
     */
    const alreadyExists = computed((): boolean => {
      return (availableBadges.value || [])
        .some(({ label }) => label === keyword.value)
    })

    /**
     * Check if keyword already exists as an annotation class
     */
    const alreadyAdded = computed((): boolean => {
      return (tags.value || [])
        .some(({ text }) => text === keyword.value)
    })

    /**
     * Lists all tag annotations applied to the current dataset item
     */
    const showCreateButton = computed((): boolean => {
      return canCreateTags.value && !!keyword.value && !alreadyAdded.value
    })

    const onFocusInput = (): void => {
      if (tagApplierInput.value) {
        setFocus(document.getElementById('TagApplierInput'), true, true)
      }
    }

    const onFocusList = (value: boolean = true): void => {
      if (tagApplierList.value) { setFocus(tagApplierList.value, value, true) }
    }

    const onChange = (newVal: string): void => {
      setTimeout(() => {
        onFocusInput()
        keyword.value = newVal
      }, 0)
    }

    /**
     * Creates a new annotation class from a tag object
     */
    const createAnnotationClass = async (tag: InputTag): Promise<AnnotationClassPayload | null> => {
      const payload: StoreActionPayload<typeof createAnnotationClassType> = {
        annotationTypeNames: ['tag'],
        datasets: [{ id: dataset?.value?.id || -1 }],
        description: tag.text,
        images: [],
        metadata: { _color: getAutoAnnotationClassColor(tag.text) },
        name: tag.text
      }

      const { data, error } = await dispatch('aclass/createAnnotationClass', payload)
      if (error) { return null }
      return data
    }

    /**
     * Called when the user types something into the tag applier and hits enter,
     * or by `createTag` when the button to create a tag is pushed.
     *
     * Creates a tag object locally and sends a class creation request,
     * followed by an annotation request, to the backend.
     *
     * Class can be specified, or matched via tag text.
     *
     * If unmatched, the class can be created, if the current scenario allows for it.
     *
     * If not specified, it's matched
     */
    const onCreateTag = async (
      label: string,
      specifiedClass?: AnnotationClassPayload
    ): Promise<void> => {
      if (props.disabled || !label) { return }
      let tag: InputTag | undefined

      // adding already existing annotation class
      if (specifiedClass) {
        const tagAnnotation = initializeTag(
          user.value,
          props.editor,
          specifiedClass,
          videoAnnotationDuration.value
        )
        if (!tagAnnotation) { return }
        tag = toTagItem(tagAnnotation)
      // creating new annotation class
      } else {
        tag = { text: label }

        // check if a duplicate exists
        if (alreadyAdded.value) {
          keyword.value = ''
          return
        }

        // avoid glitch while adding badge
        nextTick(() => { if (tag) { tags.value.push(tag) } })
      }

      if (!tag) { return }

      tag.loading = true

      const matchedClass = specifiedClass || matchClassByName(datasetTags.value, tag.text)
      // if existing class was not matched and user is not allowed to create classes, we end here
      if (!matchedClass && !canCreateTags.value) { return }

      // Fall back to creating a class if one is not matched
      // We already know we're allowed to do so
      const annotationClass = matchedClass || await createAnnotationClass(tag)

      // On match, or on successful create, build a tag and send an annotation request
      if (annotationClass) {
        const tagAnnotation = initializeTag(
          user.value,
          props.editor,
          annotationClass,
          videoAnnotationDuration.value
        )
        if (!tagAnnotation) { return }

        const tagInfo = toTagItem(tagAnnotation)
        tag.style = tagInfo.style
        tag.text = tagInfo.text

        await props.editor.saveAnnotation(tagAnnotation)
      }

      tag.loading = false

      nextTick(() => {
        const element = document.getElementById('InputFieldScrollable') as HTMLDivElement | null
        scrollRefToBottom(element)
        keyword.value = ''
      })
    }

    /**
     * Called when the user clicks to delete a tag
     */
    const onDeleteTag = async (id: string): Promise<void> => {
      const tag: InputTag | undefined =
        (tags.value || [])
          .find(tag => tag.id === id)

      if (!tag) {
        console.warn(`tag '${id}' not found`)
        return
      }

      if (props.disabled) { return }

      tag.loading = true
      const tagAnnotation = (tagAnnotations.value || [])
        .find(a => a.id === tag.id)!
      await props.editor.activeView.removeAnnotation(tagAnnotation)
      tag.loading = false
    }

    watch(tagAnnotations, () => {
      tags.value = (tagAnnotations.value || [])
        .map(tag => toTagItem(tag))
    }, { immediate: true })

    return {
      tagApplierInput,
      tagApplierList,
      keyword,
      focused,
      direction,
      tags,
      user,
      videoAnnotationDuration,
      currentTeam,
      dataset,
      allClasses,
      canCreateTags,
      datasetTags,
      currentTags,
      inputBadges,
      availableBadges,
      tagAnnotations,
      alreadyExists,
      alreadyAdded,
      showCreateButton,
      createAnnotationClass,
      onFocusInput,
      onFocusList,
      onChange,
      onCreateTag,
      onDeleteTag
    }
  }
})
</script>

<!-- eslint-disable-next-line vue-scoped-css/enforce-style-type -->
<style lang="scss">
.popup-menu-tag-applier .menu__wrapper {
  @include col;
}
</style>

<style lang="scss" scoped>
.tag-applier {
  position: unset;
  @include col;
  height: 100%;
  max-height: 100%;
  width: 250px;
  background: $colorWhite;
  transform: none !important;
  overflow: visible;
  border-top: 1px solid $colorBorderLight;
  border-left: 1px solid $colorBorderLight;

  &__resizables {
    position: relative;
    @include col;
    justify-content: space-between;
    align-items: stretch;
    height: calc(100% - 60px);
    width: 100%;

    &--create {
      height: calc(100% - 60px - 48px);
    }
  }

  &:deep(.tag-applier__input__wrapper) {
    max-height: 50%;
    min-height: 49px;
  }
}
</style>
