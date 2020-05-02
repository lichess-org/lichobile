type ChallengeStatus = 'created' | 'offline' | 'canceled' | 'declined' | 'accepted'

export interface ChallengeUser {
  readonly id: string
  readonly name: string
  readonly rating: number
  readonly provisional?: boolean
}

export interface TimeControl {
  readonly type: 'clock' | 'correspondence' | 'unlimited'
  readonly show?: string
  readonly daysPerTurn?: number
  readonly limit: number
  readonly increment: number
}

export interface TimeControlClock extends TimeControl {
  readonly show: string
}

export interface TimeControlCorrespondence extends TimeControl {
  readonly daysPerTurn: number
}

export interface ChallengeData {
  challenge: Challenge
  socketVersion: number
}

export interface Challenge {
  readonly id: string
  readonly direction: 'in' | 'out'
  readonly status: ChallengeStatus
  readonly challenger?: ChallengeUser
  readonly destUser?: ChallengeUser
  readonly variant: Variant
  readonly initialFen: string | null
  readonly rated: boolean
  readonly timeControl: TimeControl
  readonly color: Color | 'random'
  readonly perf: {
    readonly icon: string
    readonly name: string
  }
}

export interface ChallengesData {
  readonly in: ReadonlyArray<Challenge>
  readonly out: ReadonlyArray<Challenge>
}

export function isTimeControlClock(t: TimeControl): t is TimeControlClock {
  return t.type === 'clock'
}

export function isTimeControlCorrespondence(t: TimeControl): t is TimeControlCorrespondence {
  return t.type === 'correspondence'
}
