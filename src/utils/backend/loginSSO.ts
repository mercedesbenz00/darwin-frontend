type Params = {
  teamName: string
}

export const loginSSO = (params: Params): void => {
  const { teamName } = params
  const path = `/api/users/authenticate/sso/saml?team_name=${teamName}`

  window.location.href = path
}
