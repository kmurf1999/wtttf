import { createProtectedRouter } from '../context';
import superjson from 'superjson';
import z from 'zod';

export const historyRouter = createProtectedRouter()
  .transformer(superjson)
  .query('getById', {
    input: z.object({
      id: z.string(),
    }),
    resolve: async ({ ctx, input }) => {
      return await ctx.prisma.gameResult.findUnique({
        where: {
          id: input.id,
        },
        select: {
          date: true,
          winnerScore: true,
          loserScore: true,
          winner: {
            select: {
              name: true,
              email: true,
              image: true,
              rating: true,
            },
          },
          loser: {
            select: {
              name: true,
              email: true,
              image: true,
              rating: true,
            },
          },
        },
      });
    },
  })
  .query('getConsecutiveWins', {
    input: z.object({
      userId: z.string(),
    }),
    resolve: async ({ ctx, input }) => {
      const allGames = await ctx.prisma.gameResult.findMany({
        where: {
          OR: [{ winnerId: input.userId }, { loserId: input.userId }],
        },
        select: {
          date: true,
          winner: {
            select: {
              id: true,
              name: true,
            },
          },
          loser: {
            select: {
              id: true,
            },
          },
        },
        orderBy: [{ date: 'desc' }],
      });
      let count = 0;
      let name = '';
      for (let i = 0; i < allGames.length; i++) {
        if (allGames[i]?.winner.id === input.userId) {
          name = allGames[i]!.winner!.name!;
          count++;
        } else {
          break;
        }
      }
      return {
        wins: count,
        name: name,
      };
    },
  });
