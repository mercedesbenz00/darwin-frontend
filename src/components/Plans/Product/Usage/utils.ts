import { BillingInfoPayload } from '@/store/modules/billing/types'
import { TeamPayload } from '@/store/types'

/**
 * Determines if the title of a usage summary item (credit ot storage), should
 * be rendered.
 *
 * The title should be rendered only if the summary item component is not the
 * only summary item component of that type, being rendered.
 *
 * For regular teams, it's always only one component.
 * For partner teams, its multiple if the partner actually has clients
 * For client teams, it's multiple if the client summary item is being rendered
 * on the partner team billing tab, so `partnerBillingInfo` will be given
 *
 * @param {TeamPayload} team
 * The team the component is being rendered for
 *
 * @param {BillingInfoPayload | null} partnerBillingInfo
 * Billing info of the partner team. Given if team is client and is being
 * rendered on the partner team billing tab.
 *
 * @returns {boolean}
 */
export const shouldRenderTitle = (
  team: TeamPayload,
  partnerBillingInfo?: BillingInfoPayload | null
): boolean => {
  if (team.managed_status === 'regular') { return false }
  if (team.managed_status === 'partner') { return team.clients.length > 0 }
  if (team.managed_status === 'client') { return !!partnerBillingInfo }
  return false
}

/**
 * Determines if the limiter component should be rendered as part of a usage
 * (credit or storage) summary item component.
 *
 * This is only the case if the component is being rendered for a client team,
 * on a partner team billing tab.
 *
 * @param {TeamPayload} team
 * The team the component is being rendered for
 *
 * @param {BillingInfoPayload | null} partnerBillingInfo
 * Billing info of the partner team. Given if team is client and is being
 * rendered on the partner team billing tab.
 *
 * @returns {boolean}
 */
export const shouldRenderLimiter = (
  team: TeamPayload,
  partnerBillingInfo?: BillingInfoPayload | null
): boolean =>
  (team.managed_status === 'client' && !!partnerBillingInfo)
