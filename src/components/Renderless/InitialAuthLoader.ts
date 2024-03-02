import { Vue, Component } from 'vue-property-decorator'

import { session } from '@/utils'

@Component({ name: 'initial-auth-loader' })
export default class InitialAuthLoader extends Vue {
  created () {
    session.onLogout((userTriggered: boolean) => {
      this.$store.dispatch('auth/logoutStore')

      if (userTriggered) {
        this.$router.replace('/login')
      } else {
        // logout was triggered automatically, due to logout from another tab,
        // or due to token expiring
        // dispatch a toast and store current path to redirect back to on repeated login
        this.$store.dispatch('toast/warning', { content: 'Session timed out. Please login again.' })
        if (this.$route.name === 'Login') {
          this.$router.replace({ params: { prev: this.$route.fullPath } })
        } else {
          this.$router.replace({ name: 'Login', params: { prev: this.$route.fullPath } })
        }
      }
    })
  }

  render () {
    return null
  }
}
