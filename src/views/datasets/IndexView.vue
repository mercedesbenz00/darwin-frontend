<template>
  <index-annotators v-if="workerMode || !$can('view_full_datasets')" />
  <index-others v-else />
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { State } from 'vuex-class'

import { RootState } from '@/store/types'

import IndexAnnotators from './IndexAnnotators.vue'
import IndexOthers from './IndexOthers.vue'

@Component({
  name: 'index-view',
  components: { IndexAnnotators, IndexOthers }
})
export default class IndexView extends Vue {
  @State((state: RootState) => state.ui.workerMode)
  readonly workerMode!: boolean
}
</script>
