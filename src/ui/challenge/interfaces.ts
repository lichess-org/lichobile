import { Challenge } from '../../lichess/interfaces/challenge'

export interface ChallengeState {
  pingTimeoutId: number
  challenge: Mithril.Stream<Challenge | undefined>
  joinChallenge(): Promise<void>
  declineChallenge(): Promise<void>
  cancelChallenge(): Promise<void>
}
