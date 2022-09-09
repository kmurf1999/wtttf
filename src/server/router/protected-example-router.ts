import z from "zod";
import { createProtectedRouter } from "./context";

// Example router with queries that can only be hit if the user requesting is signed in
export const protectedExampleRouter = createProtectedRouter()
  .query("getSession", {
    resolve({ ctx }) {
      return ctx.session;
    },
  })
  .query("getUsersByName", {
    input: z.object({
      name: z.string(),
    }),
    resolve: async ({ ctx, input }) => {
      return await ctx.prisma.user.findMany({
        where: {
          name: { contains: input.name },
          // id: { not: ctx.session.user.id },
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
  })
  .query("getGameInProgress", {
    resolve: async ({ ctx }) => {
      const me = await ctx.prisma.user.findUnique({
        where: { id: ctx.session.user.id },
      });
      if (!me?.gameInProgressId) {
        throw new Error("No game in progress");
      }
      return await ctx.prisma.gameInProgress.findUnique({
        where: {
          id: me.gameInProgressId,
        },
        include: {
          players: {
            select: {
              name: true,
              rating: true,
              image: true,
              id: true,
            },
          },
        },
      });
    },
  });
