import z from "zod";
import { createProtectedRouter } from "./context";
import * as trpc from "@trpc/server";

enum Events {
  SEND_MESSAGE = "SEND_MESSAGE",
}
type Message = {
  msg: string;
};

// Example router with queries that can only be hit if the user requesting is signed in
export const protectedExampleRouter = createProtectedRouter()
  .mutation("sendMessage", {
    input: z.object({
      msg: z.string(),
    }),
    resolve: async ({ ctx, input }) => {
      console.log("HERE");
      ctx.ee.emit(Events.SEND_MESSAGE, { msg: input.msg });

      return { msg: input.msg };
    },
  })
  .subscription("testSubscription", {
    resolve: async ({ ctx }) => {
      return new trpc.Subscription<Message>((emit) => {
        function onMessage(data: Message) {
          if (data.msg === "PING") {
            emit.data({
              msg: "PONG",
            });
          }
        }

        ctx.ee.on(Events.SEND_MESSAGE, onMessage);

        return () => {
          ctx.ee.off(Events.SEND_MESSAGE, onMessage);
        };
      });
    },
  })
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
          id: { not: ctx.session.user.id },
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
              rating: true,
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
              rating: true,
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
