<template>
  <button class="assignment-dropdown-trigger">
    <!-- TODO: Move to external SVG -->
    <svg
      width="13"
      height="13"
      viewBox="0 0 13 13"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="6.5"
        cy="6.5"
        r="6.5"
        fill="#E3EAF2"
      />
      <path
        d="M9.94254 4H3.05746C2.22303 4 1.75561 4.96169 2.27114 5.61782L5.71368
           9.99923C6.11406 10.5088 6.88594 10.5088 7.28632 9.99923L10.7289
           5.61782C11.2444 4.96169 10.777 4 9.94254 4Z"
        fill="#91A9C0"
      />
    </svg>
  </button>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({ name: 'AssignmentDropdownTrigger' })
</script>

<style lang="scss" scoped>
.assignment-dropdown-trigger {
  height: 100%;
  width: 100%;
  padding: 0;
  background: transparent;
  border-radius: 50%;
}

.assignment-dropdown-trigger svg {
  height: 100%;
  width: 100%;
}

.assignment-dropdown-trigger {
  svg circle {
    fill: transparent;
    transition: box-shadow .2s ease-in-out;
    transition: fill .2s ease-in-out;
  }

  svg path {
    fill: $colorAliceShade;
    box-shadow: 0px 3px 4px rgba(145, 169, 192, 0.3);
    transition: box-shadow .2s ease-in-out;
    transition: fill .2s ease-in-out;
  }
}

.assignment-dropdown-trigger:hover {
  box-shadow: 0px 3px 4px rgba(145, 169, 192, 0.3);

  svg circle {
    fill: $colorAliceShade;
    box-shadow: 0px 3px 4px rgba(145, 169, 192, 0.3);
  }

  svg path {
    fill: $colorAliceNight;
    box-shadow: none;
  }
}
</style>
