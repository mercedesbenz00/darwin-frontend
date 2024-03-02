import { Company, CompanyIdentifier } from 'intercom-client/Company'
import { Vue, Watch, Component } from 'vue-property-decorator'
import { State } from 'vuex-class'

import { BillingInfoPayload } from '@/store/modules/billing/types'
import {
  MembershipPayload,
  MembershipRole,
  RootState,
  TeamPayload,
  UserPayload
} from '@/store/types'
import { getHighestRole, session } from '@/utils'

/**
 * IntercomRole is similar to `MembershipRole`
 * The only thing different is `user` = MembershipRole.member
 * For Sales Team's sake, we changed the name from `member` to `user`.
 */
type IntercomRole = Omit<MembershipRole, 'member'> | 'user'

/* eslint-disable camelcase */
type IntercomData = {
  horizontal_padding: number
  email: string
  name: string
  inserted_at: string
  show_notifications: boolean
  tutorial_seen: boolean
  superuser: boolean
  avatar?: { type: string; image_url: string; }
  team_role?: IntercomRole
  company?: CompanyIdentifier & Partial<Company>
}
/* eslint-enable camelcase */

const resolveIntercomCompany =
  (currentTeam: TeamPayload | null, billingInfo: BillingInfoPayload | null):
   (CompanyIdentifier & Partial<Company> | null) => {
    if (currentTeam) {
      const { id, name, inserted_at: insertedAt, members, ...teamAttrs } = currentTeam
      return {
        company_id: `${id}`,
        name,
        created_at: (new Date(insertedAt).getTime()) / 1000,
        size: members.length,
        custom_attributes: { freemium: billingInfo?.freemium, ...teamAttrs },
      }
    }
    return null
  }

const MEMBERSHIP_ROLE_TO_INTERCOM_ROLE: Record<MembershipRole, IntercomRole> = {
  annotator: 'annotator',
  member: 'user',
  admin: 'admin',
  owner: 'owner',
  workforce_manager: 'workforce_manager'
}

@Component({ name: 'intercom-loader' })
export default class IntercomLoader extends Vue {
  @State((state: RootState) => state.auth.authenticated)
  authenticated!: boolean

  @State((state: RootState) => state.user.profile)
  profile!: UserPayload | null

  @State((state: RootState) => state.team.currentTeam)
  currentTeam!: TeamPayload | null

  @State((state: RootState) => state.team.memberships)
  memberships!: MembershipPayload[]

  @State((state: RootState) => state.ui.sidebarMinimized)
  sidebarMinimized!: boolean

  @State((state: RootState) => state.billing.billingInfo)
  billingInfo!: BillingInfoPayload | null

  get sidebarWidth (): number {
    if (this.sidebarMinimized) {
      return this.$theme.getSidebarCollapsedWidth()
    }
    return this.$theme.getSidebarExpandedWidth()
  }

  created (): void {
    session.onLogout(() => this.shutdownIntercom())
  }

  shutdownIntercom (): void {
    const { $intercom } = this
    if (!$intercom) { return }
    $intercom.shutdown()
  }

  bootIntercom (): void {
    const { $intercom } = this
    if (!$intercom) { return }
    if ($intercom.isBooted) { return }

    $intercom.boot({
      hide_default_launcher: true,
      custom_launcher_selector: '#feedback-trigger',
      alignment: 'left'
    })
  }

  @Watch('authenticated', { immediate: true })
  onAuthenticated (): void {
    const { $intercom } = this
    if (!$intercom) { return }

    if (this.authenticated) {
      // if intercom is already ready, the once callback will not be executed.
      if ($intercom.ready) {
        this.bootIntercom()
      } else {
        $intercom.once('ready', () => this.bootIntercom())
      }
    } else {
      this.shutdownIntercom()
    }
  }

  @Watch('profile', { immediate: true })
  onProfileChange (): void { this.updateIntercom() }

  @Watch('currentTeam', { immediate: true })
  onTeamChange (): void { this.updateIntercom() }

  @Watch('sidebarMinimized')
  onSidebarMinimizedChange (): void { this.updateIntercom() }

  updateIntercom (): void {
    const { currentTeam, memberships, profile, sidebarWidth, $intercom, billingInfo } = this
    if (!profile || !$intercom) { return }

    const {
      email,
      first_name: firstName,
      last_name: lastName,
      image,
      ...profileAttrs
    } = profile
    const currentUserMemberships = memberships.filter(member => member.user_id === profile.id)
    const teamRole = currentUserMemberships.length > 0
      ? getHighestRole([...currentUserMemberships])
      : undefined
    const intercomData: IntercomData = {
      horizontal_padding: sidebarWidth + 10,
      email,
      name: `${firstName} ${lastName}`,
      team_role: teamRole ? MEMBERSHIP_ROLE_TO_INTERCOM_ROLE[teamRole] : undefined,
      ...(
        image
          ? { avatar: { type: 'avatar', image_url: image.thumbnail_url } }
          : {}
      ),
      ...profileAttrs
    }

    const company = resolveIntercomCompany(currentTeam, billingInfo)
    if (company) { intercomData.company = company }

    $intercom.update({ ...intercomData, hide_default_launcher: true })
  }

  render (): null {
    return null
  }
}
