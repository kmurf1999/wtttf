import { createProtectedRouter } from '../context';
import superjson from 'superjson';
import z from 'zod';

const defaultRating = 1000;

export const historyRouter = createProtectedRouter()
  .transformer(superjson)
  .query('getById', {
    input: z.object({
      id: z.string(),
    }),
    resolve: async ({ ctx, input }) => {
      const result = (await ctx.prisma.gameResult.findUnique({
        where: {
          id: input.id,
        },
        select: {
          date: true,
          winnerScore: true,
          loserScore: true,
          winner: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              rating: true,
            },
          },
          loser: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              rating: true,
            },
          },
        },
      })) as any;

      const winnerPreviousResult = await ctx.prisma.gameResult.findFirst({
        where: {
          OR: [{ winnerId: result?.winner.id }, { loserId: result?.winner.id }],
          AND: { date: { lt: result?.date } },
          NOT: {
            id: result?.id,
          },
        },
        select: {
          id: true,
          loserId: true,
          winnerId: true,
          winnerRating: true,
          loserRating: true,
        },
      });

      const loserPreviousResult = await ctx.prisma.gameResult.findFirst({
        where: {
          OR: [{ winnerId: result?.loser.id }, { loserId: result?.loser.id }],
          AND: { date: { lt: result?.date } },
          NOT: {
            id: result?.id,
          },
        },
        select: {
          id: true,
          loserId: true,
          winnerId: true,
          winnerRating: true,
          loserRating: true,
        },
      });

      result.winner.previousRating =
        winnerPreviousResult?.winnerId === result?.winner.id
          ? winnerPreviousResult?.winnerRating
          : winnerPreviousResult?.loserRating ?? defaultRating;
      result.loser.previousRating =
        loserPreviousResult?.winnerId === result?.winner.id
          ? loserPreviousResult?.winnerRating
          : loserPreviousResult?.loserRating ?? defaultRating;

      return result;
    },
  });
