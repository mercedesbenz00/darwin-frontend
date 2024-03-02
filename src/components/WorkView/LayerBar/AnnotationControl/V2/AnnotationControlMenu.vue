<template>
  <div class="annotation-control-menu">
    <delete-all-visible-annotations
      v-if="!readonly"
      class="annotation-control__delete"
      @close="$emit('close')"
    />
    <hide-by-class class="annotation-control__classes" />
    <hide-by-author class="annotation-control__authors" />
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, watch } from 'vue'

import HideByAuthor from '@/components/WorkView/LayerBar/AnnotationControl/HideByAuthor/HideByAuthor.vue'
import HideByClass from '@/components/WorkView/LayerBar/AnnotationControl/HideByClass/HideByClass.vue'
import { useStore } from '@/composables'
import { StageAnnotation } from '@/store/modules/workview/types'

import DeleteAllVisibleAnnotations from './DeleteAllVisibleAnnotations.vue'

export default defineComponent({
  name: 'AnnotationControlMenu',
  components: {
    DeleteAllVisibleAnnotations,
    HideByAuthor,
    HideByClass
  },
  props: {
    readonly: { required: false, default: false, type: Boolean }
  },
  setup () {
    const { getters, dispatch } = useStore()

    const nonTagAnnotations = computed<StageAnnotation[]>(
      () => getters['workview/selectedStageNonTagAnnotations']
    )

    watch(
      nonTagAnnotations,
      () => {
        dispatch('workview/refreshAnnotationsVisibility')
      }
    )
  }
})
</script>

<style lang="scss" scoped>
.annotation-control-menu {
  width: 225px;
  max-height: 80vh;
  overflow-y: auto;
  border-radius: 3px;
  padding: 7px 0;
}

.annotation-control__delete {
  margin-bottom: 5px;
}

.annotation-control__classes {
  margin-bottom: 5px;
}

.annotation-control__authors {
  margin-bottom: 5px;
}
</style>
