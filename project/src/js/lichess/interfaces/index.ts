
export interface LobbyData {
  lobby: {
    version: number
  }
}

export interface TimelineEntry {
  data: any;
  date: number;
  type: string;
}

export interface TimelineData {
  entries: Array<TimelineEntry>
}
