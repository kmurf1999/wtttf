export type GameResult = {
  submittedBy: string;
  winnerId: string;
  loserId: string;
  winnerScore?: number;
  loserScore?: number;
};

export type GameStateData = {
  id: string;
  status: "playing" | "finished";
  players: {
    id: string;
    connected: boolean;
  }[];
  result?: GameResult;
  resultId?: string;
};

export function createGame(id: string, players: string[]): GameState {
  return new GameState({
    id,
    status: "playing",
    players: players.map((id) => ({ id, connected: false })),
  });
}

export class GameState {
  data: GameStateData;
  constructor(data: GameStateData) {
    this.data = data;
  }
  parse(data: string) {
    return new GameState(JSON.parse(data));
  }
  stringify() {
    return JSON.stringify(this.data);
  }
  // actions
  connect(playerId: string): GameState {
    const newGame = new GameState({ ...this.data });
    const player = newGame.data.players.find((p) => p.id === playerId);
    if (!player) {
      throw new Error("Player not in game");
    }
    player.connected = true;
    return newGame;
  }
  disconnect(playerId: string): GameState {
    const nextState = new GameState({ ...this.data });
    const player = nextState.data.players.find((p) => p.id === playerId);
    if (!player) {
      throw new Error("Player not in game");
    }
    player.connected = false;
    return nextState;
  }
  postResult(result: GameResult): GameState {
    const nextState = new GameState({ ...this.data });
    if (nextState.data.result) {
      throw new Error("Result already posted");
    }
    nextState.data.result = result;
    return nextState;
  }
  acceptResult(playerId: string): GameState {
    const nextState = new GameState({ ...this.data });
    if (!nextState.data.result) {
      throw new Error("No result to accept");
    }
    if (playerId === nextState.data.result.submittedBy) {
      throw new Error("Cannot accept own result");
    }
    nextState.data.status = "finished";
    return nextState;
  }
  rejectResult(): GameState {
    const nextState = new GameState({ ...this.data });
    if (!nextState.data.result) {
      throw new Error("No result to reject");
    }
    nextState.data.result = undefined;
    return nextState;
  }
  resign(playerId: string): GameState {
    const nextState = new GameState({ ...this.data });
    const winner = nextState.data.players.find((p) => p.id !== playerId);
    if (!winner) {
      // should never happen
      throw new Error("Can't find winner");
    }
    const result = {
      submittedBy: playerId,
      winnerId: winner.id,
      loserId: playerId,
    };
    nextState.data.result = result;
    nextState.data.status = "finished";
    return nextState;
  }
}
