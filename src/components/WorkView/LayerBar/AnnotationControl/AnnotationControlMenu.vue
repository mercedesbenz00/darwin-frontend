<template>
  <div class="annotation-control-menu">
    <delete-all-visible-annotations
      v-if="!readonly && !isVersion2"
      class="annotation-control__delete"
      @close="$emit('close')"
    />
    <hide-by-class class="annotation-control__classes" />
    <hide-by-author class="annotation-control__authors" />
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, watch } from 'vue'

import { useStore } from '@/composables'
import { StageAnnotation } from '@/store/modules/workview/types'

import DeleteAllVisibleAnnotations from './DeleteAllVisibleAnnotations.vue'
import HideByAuthor from './HideByAuthor/HideByAuthor.vue'
import HideByClass from './HideByClass/HideByClass.vue'

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

    const isVersion2 = computed<boolean>(() => getters['dataset/isVersion2'])
    const nonTagAnnotations = computed<StageAnnotation[]>(
      () => getters['workview/selectedStageNonTagAnnotations']
    )

    watch(
      nonTagAnnotations,
      () => {
        dispatch('workview/refreshAnnotationsVisibility')
      }
    )

    return {
      isVersion2
    }
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
