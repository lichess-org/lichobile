export interface SearchState {
  search: (form: HTMLFormElement) => void
}

export interface Select {
  name: string
  options: Array<Option>
  default: string
}

export interface Option {
  value: string
  label: string
}
