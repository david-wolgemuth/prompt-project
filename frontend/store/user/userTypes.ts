export type User = {
  pk: string
  email: string
  first_name: string
  last_name: string
  is_staff: boolean
  active_feedback_request: any
}

export type UserState = {
  activeUser?: User
}
