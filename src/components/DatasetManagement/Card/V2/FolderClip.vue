<template>
  <!--
    Note the view box is dynamicall set. See in the code block why.
  -->
  <svg
    width="100%"
    height="100%"
    :viewBox="`${x1} ${y1} ${x2} ${y2}`"
    preserveAspectRatio="none"
    xmlns="http://www.w3.org/2000/svg"
    xmlns:xlink="http://www.w3.org/1999/xlink"
  >
    <mask id="folder-mask">
      <!-- the white fill means this part will hide what's underneath it. -->
      <rect
        :x="x1"
        :y="y1"
        :width="x2"
        :height="y2"
        fill="white"
      />
      <!--
        Autlines the folder shape. taken from figma as is
        The shape it outlines will end up being transparent in the DOM, showing
        the thumbnail underneath.
      -->
      <path
        d="M77.7419 7
           C76.6728 4.56927 74.2683 3 71.6129 3
           H12
           C7.58172 3 4 6.58172 4 11
           V11
           V78.2
           C4 82.6804 4 84.9206 4.87195 86.6319
           C5.63893 88.1372 6.86278 89.3611 8.36808 90.1281
           C10.0794 91 12.3196 91 16.8 91
           H142.202
           C146.683 91 148.923 91 150.634 90.1281
           C152.139 89.3611 153.363 88.1372 154.13 86.6319
           C155.002 84.9206 155.002 82.6804 155.002 78.2
           V23.8
           C155.002 19.3196 155.002 17.0794 154.13 15.3681
           C153.363 13.8628 152.139 12.6389 150.634 11.8719
           C148.923 11 146.683 11 142.202 11
           H83.8709
           C81.2154 11 78.8109 9.43073 77.7419 7
           V7
           Z"
        fill="black"
      />
    </mask>
    <!-- base white layer, due to card using a transparent color on hover -->
    <rect
      :x="x1"
      :y="y1"
      :width="x2"
      :height="y2"
      mask="url('#folder-mask')"
      mask-mode="alpha"
      fill="white"
    />
    <!-- layer which will change with user interaction (hover, etc) -->
    <rect
      :x="x1"
      :y="y1"
      :width="x2"
      :height="y2"
      mask="url('#folder-mask')"
      mask-mode="alpha"
      fill="currentColor"
    />
  </svg>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
/**
 * Render-only component which renders an svg to be used as a mask on top of
 * a card thumbnail, to give the thumbnail the appearance of a folder.
 *
 * This is achieved by rendering a rectangle,
 * using a a mask based on a folder-shaped path.
 */
export default defineComponent({
  setup () {

    // viewBox
    // The figma original is "0 0 161 102" but that doesn't center the folder shape correctly.
    // The values here center and scale the folder shape properly over the card, but are not
    // perfect on all sizes.
    // They have been manually picked to be as close to perfect scale as possible on the
    // default card size. They look ok but have padding at higher zoom sizes, and they
    // make the folder shape look a bit jagged at the lowest zoom.
    // To make them look a bit better at lowest zoom,
    // x1 and y1 need to decrease,
    // while x2 and y2 need to increase
    // This will give them padding at default zoom levels
    // and even greater padding at higher zoom levekls
    const x1 = 2.2
    const y1 = 1.2
    const x2 = 154.5
    const y2 = 91.5

    return { x1, x2, y1, y2 }
  }
})
</script>
