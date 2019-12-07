export interface LichessPropOption extends Array<number | string> {
    0: number
    1: string
    2: string
}

export const AutoQueen = {
  NEVER: 1,
  PREMOVE: 2,
  ALWAYS: 3
}
export const AutoQueenChoices = [
  [ AutoQueen.NEVER, 'never' ],
  [ AutoQueen.ALWAYS, 'always' ],
  [ AutoQueen.PREMOVE, 'whenPremoving' ]
] as Array<LichessPropOption>

export const SubmitMove = {
  NEVER: 0,
  CORRESPONDENCE_ONLY: 4,
  CORRESPONDENCE_UNLIMITED: 1,
  ALWAYS: 2
}
export const SubmitMoveChoices = [
  [ SubmitMove.NEVER, 'never' ],
  [ SubmitMove.CORRESPONDENCE_ONLY, 'inCorrespondenceGames' ],
  [ SubmitMove.CORRESPONDENCE_UNLIMITED, 'correspondenceAndUnlimited' ],
  [ SubmitMove.ALWAYS, 'always' ]
] as Array<LichessPropOption>

export const ConfirmResign = {
  NO: 0,
  YES: 1
}
export const ConfirmResignChoices = [
  [ ConfirmResign.NO, 'no' ],
  [ ConfirmResign.YES, 'yes' ]
] as Array<LichessPropOption>

export const AutoThreefold = {
  NEVER: 1,
  TIME: 2,
  ALWAYS: 3
}
export const AutoThreefoldChoices = [
  [ AutoThreefold.NEVER, 'never' ],
  [ AutoThreefold.ALWAYS, 'always' ],
  [ AutoThreefold.TIME, 'whenTimeRemainingLessThanThirtySeconds' ]
] as Array<LichessPropOption>

export const Takeback = {
  NEVER: 1,
  CASUAL: 2,
  ALWAYS: 3
}
export const TakebackChoices = [
  [ Takeback.NEVER, 'never' ],
  [ Takeback.ALWAYS, 'always' ],
  [ Takeback.CASUAL, 'inCasualGamesOnly' ]
] as Array<LichessPropOption>

export const Animation = {
  NONE: 0,
  FAST: 1,
  NORMAL: 2,
  SLOW: 3
}
export const AnimationChoices = [
  [ Animation.NONE, 'none' ],
  [ Animation.FAST, 'fast' ],
  [ Animation.NORMAL, 'normal' ],
  [ Animation.SLOW, 'slow' ]
] as Array<LichessPropOption>

export const Replay = {
  NEVER: 0,
  SLOW: 1,
  ALWAYS: 2
}
export const ReplayChoices = [
  [ Replay.NEVER, 'never' ],
  [ Replay.SLOW, 'onSlowGames' ],
  [ Replay.ALWAYS, 'always' ]
] as Array<LichessPropOption>

export const ClockTenths = {
  NEVER: 0,
  LOWTIME: 1,
  ALWAYS: 2
}
export const ClockTenthsChoices = [
  [ ClockTenths.NEVER, 'never' ],
  [ ClockTenths.LOWTIME, 'whenTimeRemainingLessThanTenSeconds' ],
  [ ClockTenths.ALWAYS, 'always' ]
] as Array<LichessPropOption>

export const Challenge = {
  NEVER: 1,
  RATING: 2,
  FRIEND: 3,
  ALWAYS: 4
}
export const ChallengeChoices = [
  [ Challenge.NEVER, 'never' ],
  [ Challenge.RATING, 'ifRatingIsPlusMinusX', '500' ],
  [ Challenge.FRIEND, 'onlyFriends' ],
  [ Challenge.ALWAYS, 'always' ]
] as Array<LichessPropOption>

export const Message = {
  NEVER: 1,
  FRIEND: 2,
  ALWAYS: 3
}
export const MessageChoices = [
  [ Message.NEVER, 'never' ],
  [ Message.FRIEND, 'onlyFriends' ],
  [ Message.ALWAYS, 'always' ]
] as Array<LichessPropOption>
