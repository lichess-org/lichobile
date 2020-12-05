export type PrefValue = number | string | boolean
export interface LichessPropOption {
  label: string
  value: PrefValue
  labelArg?: string
}

const BooleanNumber = {
  NO: 0,
  YES: 1
}
export const BooleanNumberChoices: readonly LichessPropOption[] = [
  makeOption(BooleanNumber.NO, 'no'),
  makeOption(BooleanNumber.YES, 'yes')
]

export const AutoQueen = {
  NEVER: 1,
  PREMOVE: 2,
  ALWAYS: 3
}
export const AutoQueenChoices: readonly LichessPropOption[] = [
  makeOption(AutoQueen.NEVER, 'never'),
  makeOption(AutoQueen.ALWAYS, 'always'),
  makeOption(AutoQueen.PREMOVE, 'whenPremoving')
]

export const SubmitMove = {
  NEVER: 0,
  CORRESPONDENCE_ONLY: 4,
  CORRESPONDENCE_UNLIMITED: 1,
  ALWAYS: 2
}
export const SubmitMoveChoices: readonly LichessPropOption[] = [
  makeOption(SubmitMove.NEVER, 'never'),
  makeOption(SubmitMove.CORRESPONDENCE_ONLY, 'inCorrespondenceGames'),
  makeOption(SubmitMove.CORRESPONDENCE_UNLIMITED, 'correspondenceAndUnlimited'),
  makeOption(SubmitMove.ALWAYS, 'always')
]

export const ConfirmResign = BooleanNumber
export const ConfirmResignChoices = BooleanNumberChoices

export const AutoThreefold = {
  NEVER: 1,
  TIME: 2,
  ALWAYS: 3
}
export const AutoThreefoldChoices: readonly LichessPropOption[] = [
  makeOption(AutoThreefold.NEVER, 'never'),
  makeOption(AutoThreefold.ALWAYS, 'always'),
  makeOption(AutoThreefold.TIME, 'whenTimeRemainingLessThanThirtySeconds')
]

export const Takeback = {
  NEVER: 1,
  CASUAL: 2,
  ALWAYS: 3
}
export const TakebackChoices: readonly LichessPropOption[] = [
  makeOption(Takeback.NEVER, 'never'),
  makeOption(Takeback.ALWAYS, 'always'),
  makeOption(Takeback.CASUAL, 'inCasualGamesOnly')
]

export const Animation = {
  NONE: 0,
  FAST: 1,
  NORMAL: 2,
  SLOW: 3
}
export const AnimationChoices: readonly LichessPropOption[] = [
  makeOption(Animation.NONE, 'none'),
  makeOption(Animation.FAST, 'fast'),
  makeOption(Animation.NORMAL, 'normal'),
  makeOption(Animation.SLOW, 'slow')
]

export const Replay = {
  NEVER: 0,
  SLOW: 1,
  ALWAYS: 2
}
export const ReplayChoices: readonly LichessPropOption[] = [
  makeOption(Replay.NEVER, 'never'),
  makeOption(Replay.SLOW, 'onSlowGames'),
  makeOption(Replay.ALWAYS, 'always')
]

export const ClockTenths = {
  NEVER: 0,
  LOWTIME: 1,
  ALWAYS: 2
}
export const ClockTenthsChoices: readonly LichessPropOption[] = [
  makeOption(ClockTenths.NEVER, 'never'),
  makeOption(ClockTenths.LOWTIME, 'whenTimeRemainingLessThanTenSeconds'),
  makeOption(ClockTenths.ALWAYS, 'always')
]

export const MoreTime = {
  NEVER: 1,
  CASUAL: 2,
  ALWAYS: 3,
}
export const MoreTimeChoices: readonly LichessPropOption[] = [
  makeOption(MoreTime.NEVER, 'never'),
  makeOption(MoreTime.ALWAYS, 'always'),
  makeOption(MoreTime.CASUAL, 'inCasualGamesOnly'),
]

export const Challenge = {
  NEVER: 1,
  RATING: 2,
  FRIEND: 3,
  ALWAYS: 4
}
export const ChallengeChoices: readonly LichessPropOption[] = [
  makeOption(Challenge.NEVER, 'never'),
  makeOption(Challenge.RATING, 'ifRatingIsPlusMinusX', '500'),
  makeOption(Challenge.FRIEND, 'onlyFriends'),
  makeOption(Challenge.ALWAYS, 'always')
]

export const Message = {
  NEVER: 1,
  FRIEND: 2,
  ALWAYS: 3
}
export const MessageChoices: readonly LichessPropOption[] = [
  makeOption(Message.NEVER, 'never'),
  makeOption(Message.FRIEND, 'onlyFriends'),
  makeOption(Message.ALWAYS, 'always')
]

function makeOption(value: PrefValue, label: string, labelArg?: string): LichessPropOption {
  return {
    value,
    label,
    labelArg,
  }
}
