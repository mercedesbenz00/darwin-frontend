import { ActionTree } from 'vuex'

import { AuthState } from '@/store/modules/auth/state'
import { RootState } from '@/store/types'

import { confirm2fa } from './confirm2fa'
import { confirmInvitation } from './confirmInvitation'
import { forgotPassword } from './forgotPassword'
import { login } from './login'
import { login2fa } from './login2fa'
import { loginWithSSO } from './loginWithSSO'
import { loginWithToken } from './loginWithToken'
import { logout } from './logout'
import { logoutStore } from './logoutStore'
import { passwordReset } from './passwordReset'
import { register } from './register'
import { selectTeam } from './selectTeam'
import { setup2fa } from './setup2fa'
import { verifyInvitation } from './verifyInvitation'
import { verifyTeamOwnerInvitation } from './verifyTeamOwnerInvitation'

type Actions = ActionTree<AuthState, RootState>

export const actions: Actions = {
  confirm2fa,
  confirmInvitation,
  forgotPassword,
  login,
  login2fa,
  loginWithToken,
  loginWithSSO,
  logout,
  logoutStore,
  passwordReset,
  register,
  selectTeam,
  setup2fa,
  verifyInvitation,
  verifyTeamOwnerInvitation
}
