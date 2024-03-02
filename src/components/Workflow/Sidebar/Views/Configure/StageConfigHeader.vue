<template>
  <div
    v-if="stage"
    class="head__container"
  >
    <div class="head-top__wrapper">
      <div
        class="head-icon__wrapper"
        :style="{ backgroundColor: themeAttrs && themeAttrs.highlightColorBackground }"
      >
        <component :is="getComponent(stage.type, 'icon')" />
      </div>
      <div class="head-action__wrapper">
        <div class="head-action-popmenu__wrapper">
          <three-dot-button
            :size="menuSize"
            @click="onMenuToggle"
          />
          <transition name="fade">
            <popup-menu-v2
              class="head-action-popmenu"
              v-if="menuVisible"
              v-click-outside="onMenuToggle"
            >
              <list-element-v2
                v-for="option in optionItems"
                :key="option.id"
                :text="option.text"
                :disabled="option.disabled"
                :selected="false"
                @click="onOption(option)"
              />
            </popup-menu-v2>
          </transition>
        </div>
        <close-button
          class="head-action-icon__wrapper"
          :size="menuSize"
          @click="deselectStage"
        />
      </div>
    </div>
    <input-field
      :value="stageName"
      @change="debouncedRenameStage($event)"
    />
    <h1
      class="stage-path__label"
      @click="copySlug"
    >
      <span>stage_id/</span>{{ stage.id }}
    </h1>
  </div>
</template>

<script lang="ts">
import debounce from 'lodash/debounce'
import { computed, defineComponent, ref } from 'vue'

import {
  IconColoredReview as ReviewStageIcon,
  IconColoredAnnotate as AnnotateStageIcon,
  IconColoredComplete as CompleteStageIcon,
  IconColoredConsensus as ConsensusStageIcon,
  IconColoredModel as ModelStageIcon,
  IconColoredDataset as DatasetStageIcon,
  IconColoredWebhook as WebhookStageIcon
} from '@/assets/icons/V2/Colored'
import { InputField } from '@/components/Common/InputField/V2'
import ListElementV2 from '@/components/Common/ListElements/ListElementV2/ListElementV2.vue'
import { ListElementV2Props } from '@/components/Common/ListElements/ListElementV2/types'
import PopupMenuV2 from '@/components/Common/PopupMenu/V2/PopupMenu.vue'
import { ThreeDotButton, DotButtonSize } from '@/components/Common/ThreeDotButton'
import { useStore } from '@/composables'
import { useWorkflowSceneStore } from '@/composables/useWorkflowSceneStore'
import { StageType } from '@/store/types/StageType'
import { CloseButton } from '@/uiKit/Icon'
import { stageTheme } from '@/utils/workflowStageTheme'

const staticOptionItems: Omit<ListElementV2Props, 'selected'>[] = [
  { id: '1', text: 'Copy Slug', event: 'copy-slug' },
  { id: '4', text: 'Unplug stage', event: 'unplug-stage' },
  { id: '5', text: 'Delete Stage', event: 'delete-stage' }
]

export default defineComponent({
  name: 'StageConfigHeader',
  components: {
    // general components
    CloseButton,
    InputField,
    ListElementV2,
    PopupMenuV2,
    ThreeDotButton,
    // stage icons
    AnnotateStageIcon,
    CompleteStageIcon,
    ConsensusStageIcon,
    DatasetStageIcon,
    ModelStageIcon,
    ReviewStageIcon,
    WebhookStageIcon
  },
  setup (props, { emit }) {
    const menuSize: DotButtonSize = DotButtonSize.SMALL
    const menuVisible = ref(false)
    const optionItems = staticOptionItems

    const store = useStore()
    const scene = useWorkflowSceneStore()
    const stage = computed(() => scene.selectedStage)

    const renameStage = (name: string): void => {
      if (!stage.value) { return }
      store.commit('v2Workflow/RENAME_STAGE', { id: stage.value.id, name })
    }

    const debouncedRenameStage = debounce(renameStage, 250)

    const themeAttrs = computed(() => {
      if (!stage.value) { return null }
      return stageTheme[stage.value.type]
    })

    const stageName = computed(() => {
      return stage.value?.name ? stage.value.name : themeAttrs.value?.stageTitle
    })

    const onMenuToggle = (): void => {
      menuVisible.value = !menuVisible.value
    }

    const getComponent = (i: StageType, sfx: string): string => {
      const prefix = (i == StageType.ConsensusEntrypoint)? 'consensus': i.toLowerCase()
      return `${prefix}-stage-${sfx ?? 'icon'}`
    }

    const onOption = (option: Omit<ListElementV2Props, 'selected'>): void => {
      onMenuToggle()
      if (!option.event) { return }
      if (!stage.value) { return }
      emit(option.event, { stageId: stage.value.id })
    }

    const deselectStage = (): void => {
      scene.selectStage(null)
    }

    const copySlug = (): void => emit('copy-slug', { stageId: stage.value?.id })

    return {
      copySlug,
      debouncedRenameStage,
      deselectStage,
      getComponent,
      menuSize,
      menuVisible,
      onMenuToggle,
      onOption,
      optionItems,
      stage,
      stageName,
      themeAttrs
    }
  }
})
</script>

<style lang="scss" scoped>
.head__container {
  display: block;
  padding: 12px;
}

.head-top__wrapper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.head-icon__wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 6px;
}

.head-action__wrapper {
  display: grid;
  grid-template-columns: repeat(2, min-content);
  grid-gap: 4px;
  align-items: center;
  place-items: center;
  width: auto;
  height: auto;
}

.head-action-icon__wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 32px;
  height: 32px;
  cursor: pointer;

  :deep(svg path) {
    stroke: $colorContentTertiary !important;
  }
}

.stage-path__label {
  @include typography(md-1, inter, 500);
  color: $colorNeutralsLight900;
  margin-top: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  &:hover {
    cursor: pointer;
  }

  & > span {
    color: $colorNeutralsLight500;
  }
}

.head-action-popmenu__wrapper {
  position: relative;
}

.head-action-popmenu {
  position: absolute;
  top: 30px;
  right: 0;
  background: #fff;
  // giving it a simple z-index resolves issues with some other
  // strangely implemented components render on top of it
  z-index: 1;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 175ms;
}

.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}
</style>
