<template>
  <dropdown
    v-bind="$attrs"
    :options="options"
    search
    v-on="$listeners"
  />
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

import Dropdown from '@/components/Common/Dropdown/LegacyDropdown.vue'

/**
 * Select-field with preset options as a list of the S3 regions
 *
 * @param {string} value - S3 region value
 */
@Component({
  name: 's3-region-select',
  components: {
    Dropdown
  }
})
export default class S3RegionSelect extends Vue {
  readonly options = [
    'us-east-2',
    'us-east-1',
    'us-west-1',
    'us-west-2',
    'af-south-1',
    'ap-east-1',
    'ap-south-1',
    'ap-northeast-3',
    'ap-northeast-2',
    'ap-southeast-1',
    'ap-southeast-2',
    'ap-northeast-1',
    'ca-central-1',
    'cn-north-1',
    'cn-northwest-1',
    'eu-central-1',
    'eu-west-1',
    'eu-west-2',
    'eu-south-1',
    'eu-west-3',
    'eu-north-1',
    'me-south-1',
    'sa-east-1'
  ]
}
</script>
