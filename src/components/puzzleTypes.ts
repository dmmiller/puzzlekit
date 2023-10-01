export type Change = {
  puzzleId: string;
  locationKey: string;
  propertyKey: string;
  value: string | null;
  teamId: string;
  playerId: string;
};

export type PuzzleEntry = {
  changeWithoutUndo: (changes: Change[]) => void;
  prepareToReset: () => void;
};

export interface PuzzleEvent extends Event {
  detail: Change[];
}

export type ServerChangeMessage = {
  type: "change";
  changes: Change[];
};

export type ServerRevertMessage = {
  type: "revert";
  changes: Change[];
};

export type ServerScoreMessage = {
  type: "score";
  scores: { team: string; score: number }[];
};

export type ServerMessage = ServerChangeMessage | ServerRevertMessage;

export type ClientMessage = {
  change: Change;
};
