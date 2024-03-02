<template>
  <team-list />
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

import TeamList from '@/components/Admin/TeamList.vue'

@Component({ name: 'admin-index-view', components: { TeamList } })
export default class IndexView extends Vue {
  mounted () {
    this.$store.dispatch('admin/getTeams')
  }
}
</script>
