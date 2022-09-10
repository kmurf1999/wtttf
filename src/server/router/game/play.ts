import * as trpc from "@trpc/server";
import superjson from "superjson";
import z from "zod";
import { createProtectedRouter } from "../context";

type GameState = {
  id: string;
  players: [
    {
      id: string;
      connected: boolean;
    }
  ];
};

type GameEvent = {
  gameId: string;
  type: "playerConnected" | "playerDisconnected";
  state: GameState;
};

export const playRouter = createProtectedRouter()
  .transformer(superjson)
  .subscription("subscribeToGame", {
    input: z.object({
      gameId: z.string(),
    }),
    resolve: async ({ ctx, input }) => {
      const game = ctx.cache.get(input.gameId) as GameState | undefined;

      if (!game) {
        throw new Error("Game not found");
      }

      if (!game.players.find((player) => player.id === ctx.session.user.id)) {
        console.log(game, ctx.session.user.id);
        throw new Error("Not a player in this game");
      }
      return new trpc.Subscription<GameEvent>((emit) => {
        function onMessage(data: GameEvent) {
          if (data.gameId === input.gameId) {
            emit.data(data);
          }
        }

        ctx.ee.on("gameEvent", onMessage);

        // connect event
        const game = { ...(ctx.cache.get(input.gameId) as GameState) };
        const me = game.players.find(
          (player) => player.id === ctx.session.user.id
        );
        if (me) me.connected = true;
        // update cache
        ctx.cache.set(input.gameId, game);
        ctx.ee.emit("gameEvent", {
          gameId: input.gameId,
          type: "playerConnected",
          state: game,
        });

        return () => {
          // disconnect event
          const game = { ...(ctx.cache.get(input.gameId) as GameState) };
          const me = game.players.find(
            (player) => player.id === ctx.session.user.id
          );
          if (me) me.connected = false;
          // update cache
          ctx.cache.set(input.gameId, game);
          ctx.ee.emit("gameEvent", {
            gameId: input.gameId,
            type: "playerDisconnected",
            state: game,
          });

          ctx.ee.off("gameEvent", onMessage);
        };
      });
    },
  })
  .query("getGameById", {
    input: z.object({
      gameId: z.string(),
    }),
    resolve: async ({ ctx, input }) => {
      const game = ctx.cache.get(input.gameId) as GameState | undefined;

      if (!game) {
        throw new Error("Game not found");
      }

      if (!game?.players.find((player) => player.id === ctx.session.user.id)) {
        throw new Error("You are not a player in this game");
      }

      return game;
    },
  });
