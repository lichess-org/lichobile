export const AutoQueen = {
  NEVER: 1,
  PREMOVE: 2,
  ALWAYS: 3
};
AutoQueen.choices = [
  [ AutoQueen.NEVER, 'never' ],
  [ AutoQueen.ALWAYS, 'always' ],
  [ AutoQueen.PREMOVE, 'whenPremoving' ]
];

export const SubmitMove = {
  NEVER: 0,
  CORRESPONDENCE_ONLY: 4,
  CORRESPONDENCE_UNLIMITED: 1,
  ALWAYS: 2
};
SubmitMove.choices = [
  [ SubmitMove.NEVER, 'never' ],
  [ SubmitMove.CORRESPONDENCE_ONLY, 'inCorrespondenceGames' ],
  [ SubmitMove.CORRESPONDENCE_UNLIMITED, 'Correspondence and unlimited' ],
  [ SubmitMove.ALWAYS, 'always' ]
];

export const ConfirmResign = {
  NO: 0,
  YES: 1
};
ConfirmResign.choices = [
  [ ConfirmResign.NO, 'no' ],
  [ ConfirmResign.YES, 'yes' ]
];

export const AutoThreefold = {
  NEVER: 1,
  TIME: 2,
  ALWAYS: 3
};
AutoThreefold.choices = [
  [ AutoThreefold.NEVER, 'never' ],
  [ AutoThreefold.ALWAYS, 'always' ],
  [ AutoThreefold.TIME, 'whenTimeRemainingLessThanThirtySeconds' ]
];

export const Takeback = {
  NEVER: 1,
  CASUAL: 2,
  ALWAYS: 3
};
Takeback.choices = [
  [ Takeback.NEVER, 'never' ],
  [ Takeback.ALWAYS, 'always' ],
  [ Takeback.CASUAL, 'inCasualGamesOnly' ]
];

export const Animation = {
  NONE: 0,
  FAST: 1,
  NORMAL: 2,
  SLOW: 3
};
Animation.choices = [
  [ Animation.NONE, 'none' ],
  [ Animation.FAST, 'fast' ],
  [ Animation.NORMAL, 'normal' ],
  [ Animation.SLOW, 'slow' ]
];

export const Replay = {
  NEVER: 0,
  SLOW: 1,
  ALWAYS: 2
};
Replay.choices = [
  [ Replay.NEVER, 'never' ],
  [ Replay.SLOW, 'onSlowGames' ],
  [ Replay.ALWAYS, 'always' ]
];

export const ClockTenths = {
  NEVER: 0,
  LOWTIME: 1,
  ALWAYS: 2
};
ClockTenths.choices = [
  [ ClockTenths.NEVER, 'never' ],
  [ ClockTenths.LOWTIME, 'whenTimeRemainingLessThanTenSeconds' ],
  [ ClockTenths.ALWAYS, 'always' ]
];

export const Challenge = {
  NEVER: 1,
  RATING: 2,
  FRIEND: 3,
  ALWAYS: 4
};
Challenge.choices = [
  [ Challenge.NEVER, 'never' ],
  [ Challenge.RATING, 'ifRatingIsPlusMinusX', 500 ],
  [ Challenge.FRIEND, 'onlyFriends' ],
  [ Challenge.ALWAYS, 'always' ]
];

export const Message = {
  NEVER: 1,
  FRIEND: 2,
  ALWAYS: 3
};
Message.choices = [
  [ Message.NEVER, 'never' ],
  [ Message.FRIEND, 'onlyFriends' ],
  [ Message.ALWAYS, 'always' ]
];

export function swapKeyValue(array) {
  return array.map(v => [v[1], v[0], v[2]]);
}
