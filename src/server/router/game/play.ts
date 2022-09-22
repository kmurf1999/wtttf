import { PrismaClient } from '@prisma/client';
import * as trpc from '@trpc/server';
import superjson from 'superjson';
import z from 'zod';
import { calcRating } from '../../../utils/rating';
import { GameState, parseGame } from '../../gameState';
import { createProtectedRouter } from '../context';

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
  },
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
    throw new Error('User not found');
  }

  const newRatings = calcRating(winner.rating, loser.rating, 30, true);
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
      winnerScore,
      winnerRating,
      loserId,
      loserScore,
      loserRating,
    },
  });
  const gameUpdate = prisma.game.delete({
    where: {
      id: gameId,
    },
  });
  const [res] = await prisma.$transaction([
    gameResult,
    gameUpdate,
    winnerUpdate,
    loserUpdate,
  ]);

  return res;
}

export const playRouter = createProtectedRouter()
  .transformer(superjson)
  .subscription('subscribeToGame', {
    input: z.object({
      gameId: z.string(),
    }),
    resolve: async ({ ctx, input }) => {
      const game = parseGame(await ctx.redis.get(input.gameId));
      if (!game) {
        throw new Error('Game not found');
      }
      if (
        !game.data.players.find((player) => player.id === ctx.session.user.id)
      ) {
        throw new Error('Not a player in this game');
      }
      return new trpc.Subscription<GameState>(async (emit) => {
        function onMessage(state: GameState) {
          if (state.data.id === input.gameId) {
            emit.data(state);
          }
        }

        ctx.redis.on('gameEvent', onMessage);
        // send connect event
        const game = parseGame(await ctx.redis.get(input.gameId));
        if (!game) {
          throw new Error('Game not found');
        }
        const nextState = game.connect(ctx.session.user.id);
        // update cache
        ctx.redis.set(input.gameId, nextState.serialize());
        // emit event
        ctx.redis.emit('gameEvent', nextState);

        return async () => {
          // disconnect event
          const game = parseGame(await ctx.redis.get(input.gameId));
          if (!game) {
            throw new Error('Game not found');
          }
          const nextState = game.disconnect(ctx.session.user.id);
          // update cache
          ctx.redis.set(input.gameId, nextState.serialize());
          // emit event
          ctx.redis.emit('gameEvent', nextState);

          ctx.redis.off('gameEvent', onMessage);
        };
      });
    },
  })
  .mutation('postGameResult', {
    input: z.object({
      gameId: z.string(),
      winnerId: z.string(),
      loserId: z.string(),
      winnerScore: z.number().optional(),
      loserScore: z.number().optional(),
    }),
    resolve: async ({ ctx, input }) => {
      // get game from cache
      const game = parseGame(await ctx.redis.get(input.gameId));
      if (!game) {
        throw new Error('Game not found');
      }
      const nextState = game.postResult({
        submittedBy: ctx.session.user.id,
        ...input,
      });
      // update cache
      ctx.redis.set(input.gameId, nextState.serialize());
      // emit event
      ctx.redis.emit('gameEvent', nextState);
    },
  })
  .mutation('rejectGameResult', {
    input: z.object({
      gameId: z.string(),
    }),
    resolve: async ({ ctx, input }) => {
      // get game from cache
      const game = parseGame(await ctx.redis.get(input.gameId));
      if (!game) {
        throw new Error('Game not found');
      }
      const nextState = game.rejectResult();
      // update cache
      ctx.redis.set(input.gameId, nextState.serialize());
      // emit event
      ctx.redis.emit('gameEvent', nextState);
    },
  })
  .mutation('acceptGameResult', {
    input: z.object({
      gameId: z.string(),
    }),
    resolve: async ({ ctx, input }) => {
      const game = parseGame(await ctx.redis.get(input.gameId));
      if (!game) {
        throw new Error('Game not found');
      }

      const nextState = game.acceptResult(ctx.session.user.id);
      if (!nextState.data.result) {
        throw new Error('Internal error');
      }

      const gameResult = await insertGameResult(ctx.prisma, {
        gameId: input.gameId,
        ...nextState.data.result,
      });
      // add result id to event
      // TODO this should be in resign function
      nextState.data.resultId = gameResult.id;

      ctx.redis.set(input.gameId, nextState.serialize());
      // emit event
      ctx.redis.emit('gameEvent', nextState);

      return gameResult;
    },
  })
  .mutation('resignGame', {
    input: z.object({
      gameId: z.string(),
    }),
    resolve: async ({ ctx, input }) => {
      const game = parseGame(await ctx.redis.get(input.gameId));
      if (!game) {
        throw new Error('Game not found');
      }

      const nextState = game.resign(ctx.session.user.id);
      if (!nextState.data.result) {
        throw new Error('Internal error');
      }

      const gameResult = await insertGameResult(ctx.prisma, {
        gameId: input.gameId,
        ...nextState.data.result,
      });
      // add result id to event
      // TODO this should be in resign function
      nextState.data.resultId = gameResult.id;

      ctx.redis.del(input.gameId, nextState.serialize());
      // emit
      ctx.redis.emit('gameEvent', nextState);

      return gameResult;
    },
  })
  .query('getGameById', {
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
        throw new Error('Game not found');
      }

      // TODO
      // if (!game?.players.find((player) => player.id === ctx.session.user.id)) {
      //   throw new Error("You are not a player in this game");
      // }

      return game;
    },
  })
  .query('getCurrentGame', {
    resolve: async ({ ctx }) => {
      const game = await ctx.prisma.game.findFirst({
        where: {
          players: {
            some: {
              id: ctx.session.user.id,
            },
          },
        },
        select: {
          id: true,
        },
      });
      return game;
    },
  });
