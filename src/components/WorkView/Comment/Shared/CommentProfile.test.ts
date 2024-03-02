import { createLocalVue, shallowMount } from '@vue/test-utils'
import VueLazyload from 'vue-lazyload'

import CommentProfile from './CommentProfile.vue'

const localVue = createLocalVue()
localVue.use(VueLazyload)

const loadComponent = () => {
  return shallowMount(
    CommentProfile,
    {
      localVue,
      propsData: {
        author: {
          first_name: 'Test',
          last_name: 'Me',
          image: {
            url: 'url'
          }
        },
        comment: {
        }
      },
      mocks: {
        $theme: { getCurrentScale: () => 1 }
      }
    }
  )
}

it('renders profile without an issue', () => {
  const wrapper = loadComponent()
  expect(wrapper).toMatchSnapshot()
})

it('renders full name', () => {
  const wrapper = loadComponent()
  expect(wrapper.find('.comment-profile__name').text()).toContain('Test Me')
})
