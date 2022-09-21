import { createProtectedRouter, createRouter } from './context';
import superjson from 'superjson';
import { z } from 'zod';

const protectedRouter = createProtectedRouter()
  .transformer(superjson)
  .mutation('updateUserInfo', {
    input: z.object({
      name: z.string(),
    }),
    resolve: async ({ ctx, input }) => {
      return await ctx.prisma.user.update({
        where: {
          id: ctx.session.user.id,
        },
        data: {
          name: input.name,
        },
      });
    },
  });

const router = createRouter()
  .transformer(superjson)
  .query('get', {
    input: z.object({
      userId: z.string(),
    }),
    resolve: async ({ ctx, input }) => {
      return await ctx.prisma.user.findUnique({
        where: {
          id: input.userId,
        },
        select: {
          id: true,
          email: true,
          name: true,
          image: true,
          rating: true,
          createdAt: true,
          _count: {
            select: {
              wins: true,
              losses: true,
            },
          },
        },
      });
    },
  })
  .query('recentGames', {
    input: z.object({
      userId: z.string(),
    }),
    resolve: async ({ ctx, input }) => {
      const games = await ctx.prisma.gameResult.findMany({
        where: {
          OR: [
            {
              winnerId: input.userId,
            },
            {
              loserId: input.userId,
            },
          ],
        },
        orderBy: {
          date: 'desc',
        },
        select: {
          winner: {
            select: {
              id: true,
              name: true,
              image: true,
              email: true,
            },
          },
          loser: {
            select: {
              id: true,
              name: true,
              image: true,
              email: true,
            },
          },
          winnerScore: true,
          winnerRating: true,
          loserScore: true,
          loserRating: true,
          date: true,
        },
      });

      return games;
    },
  })
  .query('ratingHistory', {
    input: z.object({
      userId: z.string(),
    }),
    resolve: async ({ ctx, input }) => {
      const games = await ctx.prisma.gameResult.findMany({
        where: {
          OR: [
            {
              winnerId: input.userId,
            },
            {
              loserId: input.userId,
            },
          ],
        },
        orderBy: {
          date: 'desc',
        },
        select: {
          winnerId: true,
          loserId: true,
          winnerRating: true,
          loserRating: true,
          date: true,
        },
      });

      return games
        .map((g) => ({
          rating: g.winnerId === input.userId ? g.winnerRating : g.loserRating,
          date: g.date,
        }))
        .filter((g) => g.rating > 0);
    },
  });

export const userRouter = createRouter().merge(protectedRouter).merge(router);
