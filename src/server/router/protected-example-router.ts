import z from 'zod';
import { createProtectedRouter } from './context';

// Example router with queries that can only be hit if the user requesting is signed in
export const protectedExampleRouter = createProtectedRouter()
  .query('getSession', {
    resolve({ ctx }) {
      return ctx.session;
    },
  })
  .query('getUsersByName', {
    input: z.object({
      name: z.string(),
    }),
    resolve: async ({ ctx, input }) => {
      return await ctx.prisma.user.findMany({
        where: {
          name: { contains: input.name },
          id: { not: ctx.session.user.id },
          isActive: true,
        },
        select: {
          id: true,
          name: true,
          image: true,
          rating: true,
          email: true,
        },
        take: 10,
      });
    },
  });
