<template>
  <div class="hide-by-class">
    <label class="hide-by-class__title">Hide all by class:</label>
    <label
      v-if="activeClassStats.length === 0"
      class="hide-by-class__empty"
    >No annotations present</label>
    <template v-else>
      <hide-by-class-item
        v-for="(stat, index) of activeClassStats"
        :key="`class-${index}`"
        class="annotation-control__class"
        :annotation-class="stat.annotationClass"
        :count="stat.count"
        :selected="hiddenClassesMap[stat.annotationClass.id]"
        @click="onAnnotationClassItem(stat.annotationClass)"
      />
    </template>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { Getter, State } from 'vuex-class'

import { AnnotationClassStat } from '@/store/modules/workview/types'
import { AnnotationClassPayload, RootState } from '@/store/types'

import HideByClassItem from './HideByClassItem.vue'

@Component({
  name: 'hide-by-class',
  components: { HideByClassItem }
})
export default class HideByClass extends Vue {
  @State((state: RootState) => state.workview.hiddenClassesMap)
  hiddenClassesMap!: Record<string, boolean>

  @Getter('selectedStageActiveClassStats', { namespace: 'workview' })
  activeClassStats!: AnnotationClassStat[]

  onAnnotationClassItem (annotationClass: AnnotationClassPayload) {
    this.$store.dispatch('workview/toggleAnnotationsVisibilityByClass', annotationClass.id)
  }
}
</script>

<style lang="scss" scoped>
.hide-by-class {
  width: 100%;
  @include col;
  margin-bottom: 5px;
}

.hide-by-class__title {
  @include typography(md, default, bold);
  color: $colorAliceNight;
  padding: 0 7px;
  margin-bottom: 3px;
}

.hide-by-class__empty {
  @include typography(md);
  color: $colorAliceNight;
  text-align: center;
}

.annotation-control__class {
  margin: 2px 3px;
}
</style>
