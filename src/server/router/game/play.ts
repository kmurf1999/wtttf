import { PrismaClient } from "@prisma/client";
import * as trpc from "@trpc/server";
import superjson from "superjson";
import z from "zod";
import { calcElo } from "../../../utils/rating";
import { GameState } from "../../gameState";
import { createProtectedRouter } from "../context";

async function insertGameResult(
  prisma: PrismaClient,
  {
    gameId,
    winnerId,
    loserId,
    winnerScore,
    loserScore,
  }: {
    gameId: string;
    winnerId: string;
    loserId: string;
    winnerScore?: number;
    loserScore?: number;
  }
) {
  const winner = await prisma.user.findUnique({
    where: {
      id: winnerId,
    },
  });
  const loser = await prisma.user.findUnique({
    where: {
      id: loserId,
    },
  });
  if (!winner || !loser) {
    throw new Error("User not found");
  }

  const newRatings = calcElo(winner.rating, loser.rating, 30, 0);
  const winnerRating = newRatings[0] as number;
  const loserRating = newRatings[1] as number;

  const winnerUpdate = prisma.user.update({
    where: {
      id: winnerId,
    },
    data: {
      rating: winnerRating,
    },
  });
  const loserUpdate = prisma.user.update({
    where: {
      id: loserId,
    },
    data: {
      rating: loserRating,
    },
  });
  const gameResult = prisma.gameResult.create({
    data: {
      winnerId,
      loserId,
      winnerScore,
      loserScore,
    },
  });
  const gameUpdate = prisma.game.delete({
    where: {
      id: gameId,
    },
  });
  const [res] = await prisma.$transaction([
    gameResult,
    winnerUpdate,
    loserUpdate,
    gameUpdate,
  ]);

  return res;
}

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
      if (
        !game.data.players.find((player) => player.id === ctx.session.user.id)
      ) {
        throw new Error("Not a player in this game");
      }
      return new trpc.Subscription<GameState>((emit) => {
        function onMessage(state: GameState) {
          if (state.data.id === input.gameId) {
            emit.data(state);
          }
        }

        ctx.ee.on("gameEvent", onMessage);
        // send connect event
        const game = ctx.cache.get(input.gameId) as GameState | undefined;
        if (!game) {
          throw new Error("Game not found");
        }
        const nextState = game.connect(ctx.session.user.id);
        // update cache
        ctx.cache.set(input.gameId, nextState);
        // emit event
        ctx.ee.emit("gameEvent", nextState);

        return () => {
          // disconnect event
          const game = ctx.cache.get(input.gameId) as GameState | undefined;
          if (!game) {
            throw new Error("Game not found");
          }
          const nextState = game.disconnect(ctx.session.user.id);
          // update cache
          ctx.cache.set(input.gameId, nextState);
          // emit event
          ctx.ee.emit("gameEvent", nextState);

          ctx.ee.off("gameEvent", onMessage);
        };
      });
    },
  })
  .mutation("postGameResult", {
    input: z.object({
      gameId: z.string(),
      winnerId: z.string(),
      loserId: z.string(),
      winnerScore: z.number().optional(),
      loserScore: z.number().optional(),
    }),
    resolve: async ({ ctx, input }) => {
      // get game from cache
      const game = ctx.cache.get(input.gameId) as GameState | undefined;
      if (!game) {
        throw new Error("Game not found");
      }
      const nextState = game.postResult({
        submittedBy: ctx.session.user.id,
        ...input,
      });
      // update cache
      ctx.cache.set(input.gameId, nextState);
      // emit event
      ctx.ee.emit("gameEvent", nextState);
    },
  })
  .mutation("rejectGameResult", {
    input: z.object({
      gameId: z.string(),
    }),
    resolve: async ({ ctx, input }) => {
      // get game from cache
      const game = ctx.cache.get(input.gameId) as GameState | undefined;
      if (!game) {
        throw new Error("Game not found");
      }
      const nextState = game.rejectResult();
      // update cache
      ctx.cache.set(input.gameId, nextState);
      // emit event
      ctx.ee.emit("gameEvent", nextState);
    },
  })
  .mutation("acceptGameResult", {
    input: z.object({
      gameId: z.string(),
    }),
    resolve: async ({ ctx, input }) => {
      const game = ctx.cache.get(input.gameId) as GameState | undefined;
      if (!game) {
        throw new Error("Game not found");
      }

      const nextState = game.acceptResult(ctx.session.user.id);
      if (!nextState.data.result) {
        throw new Error("Internal error");
      }

      const gameResult = await insertGameResult(ctx.prisma, {
        gameId: input.gameId,
        ...nextState.data.result,
      });
      // add result id to event
      // TODO this should be in resign function
      nextState.data.resultId = gameResult.id;

      // update cache TODO maybe delete cache entry
      ctx.cache.set(input.gameId, nextState);
      // emit event
      ctx.ee.emit("gameEvent", nextState);

      return gameResult;
    },
  })
  .mutation("resignGame", {
    input: z.object({
      gameId: z.string(),
    }),
    resolve: async ({ ctx, input }) => {
      const game = ctx.cache.get(input.gameId) as GameState | undefined;
      if (!game) {
        throw new Error("Game not found");
      }

      const nextState = game.resign(ctx.session.user.id);
      if (!nextState.data.result) {
        throw new Error("Internal error");
      }

      const gameResult = await insertGameResult(ctx.prisma, {
        gameId: input.gameId,
        ...nextState.data.result,
      });
      // add result id to event
      // TODO this should be in resign function
      nextState.data.resultId = gameResult.id;

      // update cache TODO maybe delete cache
      ctx.cache.set(input.gameId, nextState);
      // emit
      ctx.ee.emit("gameEvent", nextState);

      return gameResult;
    },
  })
  .query("getGameById", {
    input: z.object({
      gameId: z.string(),
    }),
    resolve: async ({ ctx, input }) => {
      const game = ctx.prisma.game.findUnique({
        where: { id: input.gameId },
        select: {
          id: true,
          players: {
            select: {
              id: true,
              name: true,
              email: true,
              rating: true,
              image: true,
            },
          },
        },
      });

      if (!game) {
        throw new Error("Game not found");
      }

      // TODO
      // if (!game?.players.find((player) => player.id === ctx.session.user.id)) {
      //   throw new Error("You are not a player in this game");
      // }

      return game;
    },
  });
