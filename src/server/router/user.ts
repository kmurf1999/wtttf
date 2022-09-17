import { createProtectedRouter } from './context';
import superjson from 'superjson';
import { z } from 'zod';

export const userRouter = createProtectedRouter()
  .transformer(superjson)
  .query('getMe', {
    resolve: async ({ ctx }) => {
      return await ctx.prisma.user.findUnique({
        where: {
          id: ctx.session.user.id,
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
