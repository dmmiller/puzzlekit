export type Change = {
  locationKey: string;
  propertyKey: string;
  value: string | null;
  playerId: string;
};

export type PuzzleEntry = {
  changeWithoutUndo: (changes: Change[]) => void;
  prepareToReset: () => void;
  registerForCoop: (
    playerId: string,
    callback: (changes: Change[]) => void
  ) => void;
};
