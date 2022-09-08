import { createProtectedRouter } from "./context";
import z from "zod";

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
          elo: true,
          email: true,
        },
        take: 10,
      });
    },
  })
  .query("getSentInvites", {
    resolve: async ({ ctx }) => {
      return await ctx.prisma.gameInvite.findMany({
        where: {
          fromUserId: ctx.session.user.id,
        },
        include: {
          to: {
            select: {
              name: true,
            },
          },
        },
      });
    },
  })
  .query("getReceivedInvites", {
    resolve: async ({ ctx }) => {
      return await ctx.prisma.gameInvite.findMany({
        where: {
          toUserId: ctx.session.user.id,
        },
        include: {
          from: {
            select: {
              name: true,
              elo: true,
              image: true,
            },
          },
        },
      });
    },
  })

  .mutation("declineInvite", {
    input: z.object({
      inviteId: z.string(),
    }),
    resolve: async ({ ctx, input }) => {
      return await ctx.prisma.gameInvite.delete({
        where: {
          id: input.inviteId,
          // TODO make sure toUserId is context.sewssionuser.id
        },
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
              elo: true,
              image: true,
              id: true,
            },
          },
        },
      });
    },
  })
  .mutation("joinGame", {
    input: z.object({
      inviteId: z.string(),
    }),
    resolve: async ({ ctx, input }) => {
      const invite = await ctx.prisma.gameInvite.findUnique({
        where: { id: input.inviteId },
      });
      if (!invite) {
        throw new Error("Invite not found");
      }
      // delete invite
      await ctx.prisma.gameInvite.delete({ where: { id: input.inviteId } });
      // create game in progress
      return await ctx.prisma.gameInProgress.create({
        data: {
          players: {
            connect: [
              {
                id: invite.fromUserId,
              },
              { id: invite.toUserId },
            ],
          },
        },
      });
    },
  })
  .mutation("createGame", {
    input: z.object({
      otherPlayerId: z.string(),
    }),
    resolve: async ({ ctx, input }) => {
      return await ctx.prisma.gameInvite.create({
        data: {
          fromUserId: ctx.session.user.id,
          toUserId: input.otherPlayerId,
        },
      });
    },
  });
