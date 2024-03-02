import { MembershipPayload } from '@/store/types'

import { partnerTeam, polygonTeam, v7 } from './teams'

const member: MembershipPayload = {
  id: 1,
  first_name: 'John',
  last_name: 'Doe',
  user_id: 11,
  team_id: v7.id,
  role: 'annotator',
  email: 'test@example.com',
  image: null
}

export const johnDoe = {
  ...member,
  id: 1,
  first_name: 'John',
  last_name: 'Doe',
  user_id: 11
}
export const janeDoe = {
  ...member,
  id: 2,
  first_name: 'Jane',
  last_name: 'Doe',
  user_id: 12
}
export const jamesDoe = {
  ...member,
  id: 3,
  first_name: 'James',
  last_name: 'Doe',
  user_id: 13
}
export const janeSmith = {
  ...member,
  id: 5,
  first_name: 'Jane',
  last_name: 'Smith',
  user_id: 15
}
export const jamesSmith = {
  ...member,
  id: 6,
  first_name: 'James',
  last_name: 'Smith',
  user_id: 16
}
export const mikeDoe = {
  ...member,
  id: 7,
  first_name: 'Mike',
  last_name: 'Doe',
  user_id: 17
}

export const mikeSmith = {
  ...member,
  id: 8,
  first_name: 'Mike',
  last_name: 'Smith',
  user_id: 18
}

export const marshallSmith = {
  ...member,
  id: 9,
  first_name: 'Marshall',
  last_name: 'Smith',
  user_id: 19
}

export const steveSmith = {
  ...member,
  id: 10,
  first_name: 'Steve',
  last_name: 'Smith',
  user_id: 20
}

export const juliaSmith = {
  ...member,
  id: 11,
  first_name: 'Julia',
  last_name: 'Smith',
  team_id: partnerTeam.id,
  user_id: 21
}
// to test long names
export const anastasiaLongfellowSmith = {
  ...member,
  id: 12,
  first_name: 'Anastasia',
  last_name: 'Longfellow-Smith',
  team_id: partnerTeam.id,
  user_id: 22
}
export const johnSmith = {
  ...member,
  id: 13,
  first_name: 'John',
  last_name: 'Smith',
  team_id: polygonTeam.id,
  user_id: 14
}
export const louisRaetz = {
  ...member,
  id: 14,
  first_name: 'Louis',
  last_name: 'Raetz',
  team_id: polygonTeam.id,
  user_id: 23
}
