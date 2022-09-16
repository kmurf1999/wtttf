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
  });
