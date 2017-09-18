type ChallengeStatus = 'created' | 'offline' | 'canceled' | 'declined' | 'accepted'

export interface ChallengeUser {
  id: string
  name: string
  rating: number
  provisional?: boolean
}

export interface TimeControl {
  type: 'clock' | 'correspondence' | 'unlimited'
  show?: string
  daysPerTurn?: number
  limit: number
  increment: number
}

export interface TimeControlClock extends TimeControl {
  show: string
}

export interface TimeControlCorrespondence extends TimeControl {
  daysPerTurn: number
}

export interface Challenge {
  id: string
  direction: 'in' | 'out'
  status: ChallengeStatus
  challenger?: ChallengeUser
  destUser?: ChallengeUser
  variant: Variant
  initialFen: string | null
  rated: boolean
  timeControl: TimeControl
  color: Color | 'random'
  perf: {
    icon: string
    name: string
  }
}

export interface ChallengesData {
  in: Array<Challenge>
  out: Array<Challenge>
}

export function isTimeControlClock(t: TimeControl): t is TimeControlClock {
  return t.type === 'clock'
}

export function isTimeControlCorrespondence(t: TimeControl): t is TimeControlCorrespondence {
  return t.type === 'correspondence'
}
