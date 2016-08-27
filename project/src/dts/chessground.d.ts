
interface CgSetConfig {
  orientation?: Color;
  fen?: string;
  lastMove?: Array<Pos>;
  check?: boolean;
  turnColor?: Color;
  movableColor?: Color;
  dests?: {[index: string]: Array<Pos>};
}
