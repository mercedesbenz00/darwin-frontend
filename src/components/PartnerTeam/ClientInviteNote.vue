<template>
  <paragraph-10 class="client-invite-note">
    <strong>Note:</strong> You must use the end-client’s email address to start
    the team so they may read V7's Terms of Service. This is a mandatory step
    for us to comply with copyright laws. Hosting data without the end-client's
    approval will lead to account termination.
  </paragraph-10>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import Paragraph10 from '@/components/Common/Paragraph10.vue'

export default defineComponent({ name: 'ClientInviteNote', components: { Paragraph10 } })
</script>

<style lang="scss" scoped>
.client-invite-note {
  text-align: center;
  strong {
    font-weight: bold;
    text-transform: uppercase;
  }
}
</style>
