import { PrismaClient } from "@prisma/client";
import * as trpc from "@trpc/server";
import superjson from "superjson";
import z from "zod";
import { calcElo } from "../../../utils/rating";
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
  type:
    | "playerConnected"
    | "playerDisconnected"
    | "postResult"
    | "acceptResult"
    | "rejectResult"
    | "resign";
  state: GameState;
};

async function insertGameResult(
  prisma: PrismaClient,
  winnerId: string,
  loserId: string,
  winnerScore?: number,
  loserScore?: number
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

  const [winnerRating, loserRating] = calcElo(
    winner.rating,
    loser.rating,
    30,
    0
  );

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
  const [res] = await prisma.$transaction([
    gameResult,
    winnerUpdate,
    loserUpdate,
  ]);

  return res;
}

export const playRouter = createProtectedRouter()
  .transformer(superjson)
  .mutation("resign", {
    input: z.object({
      gameId: z.string(),
    }),
    resolve: async ({ ctx, input }) => {
      const game = await ctx.prisma.game.findUnique({
        where: {
          id: input.gameId,
        },
        select: {
          id: true,
          players: {
            select: {
              id: true,
            },
          },
        },
      });
      if (!game) {
        throw new Error("Game not found");
      }
      if (!game.players.find((player) => player.id === ctx.session.user.id)) {
        throw new Error("Not a player in this game");
      }
      // submit game result
      const loserId = ctx.session.user.id;
      const winnerId = game.players.find((player) => player.id !== loserId)
        ?.id as string;

      await insertGameResult(ctx.prisma, winnerId, loserId);
      // delete game from cache
      ctx.cache.delete(game.id);
      // delete game from db
      await ctx.prisma.game.delete({
        where: {
          id: game.id,
        },
      });
      // nofity opponent that game has ended
      ctx.ee.emit("gameEvent", {
        gameId: game.id,
        type: "resign",
        state: {},
      });
    },
  })
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
