<template>
  <settings-pane title="API Keys">
    <template #body>
      <key-management />
    </template>
  </settings-pane>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

import KeyManagement from '@/components/ApiKey/KeyManagement.vue'

import SettingsPane from './SettingsPane.vue'

@Component({ name: 'api-keys', components: { KeyManagement, SettingsPane } })
export default class ApiKeys extends Vue { }
</script>

<style lang="scss" scoped>

</style>
