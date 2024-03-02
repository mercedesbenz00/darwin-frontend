import _Vue, { PluginObject } from 'vue'
import { Store } from 'vuex'

import { IsAuthorized } from '@/store/modules/auth/getters/isAuthorized'
import { AbilityOptions, MembershipRole, RootState } from '@/store/types'

/**
 * Exposes `this.$can` in all vue instances, allowing us to check authorization levels for
 * specific actions.
 */
const AbilityPlugin: PluginObject<Store<RootState>> = {
  install: (Vue: typeof _Vue, store?: Store<RootState>) => {
    Vue.prototype.$can = (
      ability: string,
      options?: AbilityOptions,
      allowedRoles: MembershipRole[] = []
    ): boolean => {
      if (!store) { return false }
      const isAuthorized = store.getters['auth/isAuthorized'] as IsAuthorized
      return isAuthorized(ability, options, allowedRoles)
    }
  }
}

export default AbilityPlugin
declare module 'vue/types/vue' {
  interface Vue {
    /**
     * Returns boolean indicating if user is authorized by backend, to perform an action.
     *
     * This uses a relatively typical $can format for abilities.
     *
     * @param {string} ability
     * The name of the ability to check. These are defined on the backend
     *
     * @param {AbilityOptions} options
     * Options object containing additional parameters of the ability to check.
     *
     * @param {string} options.subject
     * Defaults to 'all', determines the type of subject to test the ability for.
     * Could be 'stage', 'dataset', etc.
     *
     * @param {object} options.resource
     * The resource to check the ability on. Required, if `subject` is not `all`
     *
     * @param {MembershipRole[]} allowedRoles
     * Optional arguments which specifies a list of roles. If the
     * current user has any of the listed roles within the current team, the
     * function will return true EVEN if no appropriate ability is found in the
     * store.
     *
     * The intent of this is allow some UI elements to be rendered, even if the
     * backend might return an "unauthorized" response and is useful when the
     * list of abilities given to the frontend isn't sufficient to be sure if
     * user can do something.
     *
     * For example, workforce managers can only do certain things if the are
     * explicitly made dataset managers on a dataset. The frontend currently
     * doesn't receive this information.
     *
     * We can test abilities in one of three ways.
     *
     * If a user is able to perform an action on all resources within the current team, then we
     * just call:
     *
     *  `$can(abilityName)`.
     *
     * If the action is specific to a resource, then the backend
     * will define that ability with conditions specific to that resource.
     *
     * If, for example, we want to check if the user can view a stage, we call:
     *
     * `$can('view_stage', { subject: 'stage' , resource: stage })`
     *
     * We can still check if the user can view any stage on team, by calling
     *
     * `$can('view_stage')`
     *
     * To check for ability, but also allow workforce_managers through
     * regardless of result, we can use. We should only do this when absolutely
     * necessary and avoid it as much as possible. See note on backdoor in the
     * documentation for the `auth/isAuthorized` getter
     *
     * `$can('view_stage', { subject: 'all' }, ['workforce_manager'])
     */
    $can: IsAuthorized
  }
}
