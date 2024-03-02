import { Getter } from 'vuex'

import { AuthState } from '@/store/modules/auth/state'
import { Ability, AbilityOptions, RootState } from '@/store/types'
import { MembershipRole } from '@/store/types/MembershipRole'

type Resource = Record<string, string | number | boolean >
type ConditionValue = string | number | boolean

/**
 * For a single resource, returns boolean indicating if resource matches any of
 * the values for the given key.
 */
const satisfiesCondition = (
  resource: Resource,
  key: string,
  value: ConditionValue | ConditionValue[]
): boolean =>
  value instanceof Array
    ? value.includes(resource[key])
    : value === resource[key]

const satisfiesConditions = (
  resource: Resource | Resource[],
  key: string,
  value: ConditionValue | ConditionValue[]
): boolean =>
  resource instanceof Array
    ? resource.some(r => satisfiesCondition(r, key, value))
    : satisfiesCondition(resource, key, value)

/**
 * For a resource or an array of resources, returns boolean if any of them
 * satisfy the listed conditions.
 */
const checkConditions = (
  resource: Resource | Resource[],
  conditions: Ability['conditions']
): boolean => {
  if (!conditions) { return true }
  return Object.entries(conditions)
    .every(([key, value]) => satisfiesConditions(resource, key, value))
}

const defaultOptions = (state: RootState): AbilityOptions | undefined => {
  return state.team.currentTeam
    ? { subject: 'team', resource: state.team.currentTeam }
    : undefined
}

export const checkAuthorized = (
  abilities: Ability[],
  ability: string,
  options?: AbilityOptions
): boolean => {
  // a rule for 'all' subjects, without any conditions is matched -> user is authorized
  if (!options || !options.resource) {
    return abilities.some(a => a.subject === 'all' && a.actions.includes(ability) && !a.conditions)
  }

  // no conditionless all-rule found, but also no options provided -> nothing to check against
  if (!options) { return false }

  const { subject = 'all', resource } = options

  const allRule =
    abilities.find(a => a.subject === 'all' && a.actions.includes(ability))

  if (allRule && checkConditions(resource, allRule.conditions)) { return true }

  const subjectRule = abilities.find(a => a.subject === subject && a.actions.includes(ability))
  if (subjectRule && checkConditions(resource, subjectRule.conditions)) { return true }

  return false
}

export type IsAuthorized =
  (ability: string, options?: AbilityOptions, allowedRoles?: MembershipRole[]) => boolean;

const roleInCurrentTeam = (state: RootState): MembershipRole | null => {
  const { profile: user } = state.user
  const { memberships, currentTeam: team } = state.team
  if (!user || !team) { return null }
  const membership = memberships.find(m => m.team_id === team.id && m.user_id === user.id)
  if (!membership) { return null }
  return membership.role
}

/**
 * Prodcues backing function for the $can function given to every Vue instance
 * by the Ability plugin.
 *
 * Determines if currently signed in user can perform a specific action,
 * either generally, or on a specific resource.
 *
 * NOTE: Backdoor
 *
 * Currently, the frontend sometimes doesn't really know if the backend allows a
 * user to do something.
 *
 * For example, the user might be allowed to create annotator invites only, but
 * the backend might return no such ability.
 *
 * When this is the case, the final argument of the function returned by this
 * getter is a list of allowed roles. If the user's current role matches one in
 * the list, the frontend will act as if the user is allowed performing the action.
 *
 * This is a temporary measure and should be eliminated fully, eventually, as
 * it makes for bad UX and the backend still might return a 401/403 in some cases.
 */
export const isAuthorized: Getter<AuthState, RootState> =
  (state, getters, rootState): IsAuthorized => (ability, options, allowedRoles = []): boolean => {
    // We first check store abilities only. If user is authorized this way,
    // that is the correct auth approach and we return te result.
    const byAbility = checkAuthorized(
      state.abilities,
      ability,
      options || defaultOptions(rootState)
    )

    if (byAbility) { return true }

    // see backdoor section in getter doc
    const role = roleInCurrentTeam(rootState)
    return !!role && allowedRoles.includes(role)
  }
