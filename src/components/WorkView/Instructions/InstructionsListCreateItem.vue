<template>
  <li
    class="instructions-list-create-item"
    @click="$emit('click')"
  >
    New Class
  </li>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({ name: 'InstructionsListCreateItem' })
</script>

<style lang="scss" scoped>
.instructions-list-create-item {
  @include row--center;
  @include typography(md-1, default, bold);
  width: calc(100% - 40px);
  height: 40px;
  background-color: $colorWhite;
  border-radius: 5px;
  box-shadow: $shadowXS;
  color: $color90Black;
  text-align: center;
  margin: 5px 20px 20px;
  cursor: pointer;

  &:hover {
    background-color: $colorAliceBlue;
  }

  &:active {
    background-color: $colorAliceShade;
  }
}
</style>
