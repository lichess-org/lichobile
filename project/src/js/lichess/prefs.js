export const AutoQueen = {
  NEVER: 1,
  PREMOVE: 2,
  ALWAYS: 3
};
AutoQueen.choices = [
  [ AutoQueen.NEVER, 'Never' ],
  [ AutoQueen.ALWAYS, 'Always' ],
  [ AutoQueen.PREMOVE, 'When premoving' ]
];

export const SubmitMove = {
  NEVER: 0,
  CORRESPONDENCE_ONLY: 4,
  CORRESPONDENCE_UNLIMITED: 1,
  ALWAYS: 2
};
SubmitMove.choices = [
  [ SubmitMove.NEVER, 'Never' ],
  [ SubmitMove.CORRESPONDENCE_ONLY, 'Correspondence games only' ],
  [ SubmitMove.CORRESPONDENCE_UNLIMITED, 'Correspondence and unlimited' ],
  [ SubmitMove.ALWAYS, 'Always' ]
];

export const ConfirmResign = {
  NO: 0,
  YES: 1
};
ConfirmResign.choices = [
  [ ConfirmResign.NO, 'No' ],
  [ ConfirmResign.YES, 'Yes' ]
];

export const AutoThreefold = {
  NEVER: 1,
  TIME: 2,
  ALWAYS: 3
};
AutoThreefold.choices = [
  [ AutoThreefold.NEVER, 'Never' ],
  [ AutoThreefold.ALWAYS, 'Always' ],
  [ AutoThreefold.TIME, 'When time remaining < 30 seconds' ]
];

export const Takeback = {
  NEVER: 1,
  CASUAL: 2,
  ALWAYS: 3
};
Takeback.choices = [
  [ Takeback.NEVER, 'Never' ],
  [ Takeback.ALWAYS, 'Always' ],
  [ Takeback.CASUAL, 'In casual games only' ]
];

export const Animation = {
  NONE: 0,
  FAST: 1,
  NORMAL: 2,
  SLOW: 3
};
Animation.choices = [
  [ Animation.NONE, 'None' ],
  [ Animation.FAST, 'Fast' ],
  [ Animation.NORMAL, 'Normal' ],
  [ Animation.SLOW, 'Slow' ]
];

export const Replay = {
  NEVER: 0,
  SLOW: 1,
  ALWAYS: 2
};
Replay.choices = [
  [ Replay.NEVER, 'Never' ],
  [ Replay.SLOW, 'On slow games' ],
  [ Replay.ALWAYS, 'Always' ]
];

export const ClockTenths = {
  NEVER: 0,
  LOWTIME: 1,
  ALWAYS: 2
};
ClockTenths.choices = [
  [ ClockTenths.NEVER, 'Never' ],
  [ ClockTenths.LOWTIME, 'When time remaining < 10 seconds' ],
  [ ClockTenths.ALWAYS, 'Always' ]
];

export const Challenge = {
  NEVER: 1,
  RATING: 2,
  FRIEND: 3,
  ALWAYS: 4
};
Challenge.choices = [
  [ Challenge.NEVER, 'Never' ],
  [ Challenge.RATING, 'If rating is ± 500' ],
  [ Challenge.FRIEND, 'Only friends' ],
  [ Challenge.ALWAYS, 'Always' ]
];

export const Message = {
  NEVER: 1,
  FRIEND: 2,
  ALWAYS: 3
};
Message.choices = [
  [ Message.NEVER, 'Never' ],
  [ Message.FRIEND, 'Only friends' ],
  [ Message.ALWAYS, 'Always' ]
];

export function swapKeyValue(array) {
  return array.map(v => [v[1], v[0]]);
}
