import superjson from 'superjson';
import z from 'zod';
import { createRouter } from '../context';

export const rankingRouter = createRouter()
  .transformer(superjson)
  .query('get', {
    input: z.object({
      skip: z.number().optional(),
      take: z.number().optional(),
    }),
    resolve: async ({ ctx, input }) => {
      return await ctx.prisma.user.findMany({
        skip: input.skip,
        take: input.take,
        orderBy: {
          rating: 'desc',
        },
        where: {
          OR: [
            {
              wins: {
                some: {
                  id: { not: undefined },
                },
              },
            },
            {
              losses: {
                some: {
                  id: { not: undefined },
                },
              },
            },
          ],
        },
        select: {
          name: true,
          email: true,
          image: true,
          rating: true,
          id: true,
          _count: {
            select: {
              wins: true,
              losses: true,
            },
          },
        },
      });
    },
  });
