export interface TournamentCreateState {
  errors: Mithril.Property<CreateErrorResponse>
  send: (form: HTMLFormElement) => void
}

export interface CreateErrorResponse {
  variant: Array<string>
}
