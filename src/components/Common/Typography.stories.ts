import Header3 from './Header3.vue'
import Header4 from './Header4.vue'
import Paragraph10 from './Paragraph10.vue'
import Paragraph14 from './Paragraph14.vue'

const stories = {
  title: 'Common/Typography'
}

const LOREM =
  `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
   do eiusmod tempor incididunt ut labore et dolore magna aliqua.
   Ut enim ad minim veniam, quis nostrud exercitation ullamco
   laboris nisi ut aliquip ex ea commodo consequat. Duis aute
   irure dolor in reprehenderit in voluptate velit esse cillum
   dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat
   non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`

export default stories

export const Default = () => ({
  components: { Header3, Header4, Paragraph10, Paragraph14 },
  data: () => ({ lorem: LOREM }),
  template: `
    <div style="display: grid; gap: 1em; max-width: 600px;">
      <header-3>Header 3</header-3>
      <paragraph-10>Paragraph 10, {{lorem}}</paragraph-10>
      <header-4>Header 4</header-4>
      <paragraph-14>Paragraph 14, {{lorem}}</paragraph-14>
    </div>

  `
})
