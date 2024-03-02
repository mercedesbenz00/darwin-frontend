<template>
  <div class="hide-by-author">
    <label class="hide-by-author__title">Hide all by author:</label>
    <label
      v-if="activeActorStats.length === 0"
      class="hide-by-author__empty"
    >No authors present</label>
    <template v-else>
      <hide-by-author-item
        v-for="(stat, index) of activeActorStats"
        :key="`author-${index}`"
        class="hide-by-author__item"
        :actor="stat.actor"
        :count="stat.count"
        :selected="hiddenAuthorsMap[stat.actor.user_id]"
        @click="onAuthorItem(stat)"
      />
    </template>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { Getter, State } from 'vuex-class'

import { AnnotationActorStat } from '@/store/modules/workview/types'
import { RootState } from '@/store/types'

import HideByAuthorItem from './HideByAuthorItem.vue'

@Component({
  name: 'hide-by-author',
  components: { HideByAuthorItem }
})
export default class HideByAuthor extends Vue {
  @State((state: RootState) => state.workview.hiddenAuthorsMap)
  hiddenAuthorsMap!: Record<string, boolean>

  @Getter('selectedStageActiveActorStats', { namespace: 'workview' })
  activeActorStats!: AnnotationActorStat[]

  onAuthorItem (actorStat: AnnotationActorStat) {
    this.$store.dispatch('workview/toggleAnnotationsVisibilityByAuthor', actorStat.actor.user_id)
  }
}
</script>

<style lang="scss" scoped>
.hide-by-author {
  width: 100%;
  @include col;
}

.hide-by-author__title {
  @include typography(md, default, bold);
  color: $colorAliceNight;
  padding: 0 7px;
  margin-bottom: 3px;
}

.hide-by-author__empty {
  @include typography(md);
  color: $colorAliceNight;
  text-align: center;
}

.hide-by-author__item {
  margin: 2px 3px;
}
</style>
