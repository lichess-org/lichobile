export interface TournamentCreateState {
  errors: Mithril.Property<CreateErrorResponse>
  create: (form: HTMLFormElement) => void
}

export interface TournamentCreateResponse {
  id: string
}

export interface CreateErrorResponse {
  global: Array<string>
  variant: Array<string>
  mode: Array<string>
  time: Array<string>
  increment: Array<string>
  duration: Array<string>
  timeToStart: Array<string>
}
