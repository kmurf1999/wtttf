import { GameInvite } from "@prisma/client";
import * as trpc from "@trpc/server";
import superjson from "superjson";
import z from "zod";
import { createProtectedRouter } from "../context";

enum Events {
  SEND_INVITE = "SEND_INVITE",
}

type GameInviteEvent = GameInvite & {
  from: {
    name: string;
    elo: number;
    image: string;
  };
};

export const inviteRouter = createProtectedRouter()
  .transformer(superjson)
  .subscription("streamReceivedInvites", {
    resolve: async ({ ctx }) => {
      return new trpc.Subscription<GameInviteEvent>((emit) => {
        function onMessage(data: GameInviteEvent) {
          if (data.toUserId === ctx.session.user.id) {
            emit.data(data);
          }
        }

        ctx.ee.on(Events.SEND_INVITE, onMessage);

        return () => {
          ctx.ee.off(Events.SEND_INVITE, onMessage);
        };
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
  .mutation("sendInvite", {
    input: z.object({
      otherPlayerId: z.string(),
    }),
    resolve: async ({ ctx, input }) => {
      const invite = await ctx.prisma.gameInvite.create({
        data: {
          fromUserId: ctx.session.user.id,
          toUserId: input.otherPlayerId,
        },
        include: {
          from: {
            select: {
              name: true,
              image: true,
              rating: true,
            },
          },
        },
      });

      ctx.ee.emit(Events.SEND_INVITE, invite);

      return invite;
    },
  })
  .mutation("acceptInvite", {
    input: z.object({
      inviteId: z.string(),
    }),
    resolve: async ({ ctx, input }) => {
      // TODO make sure invite toId is context.sessionuser.id
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
  });
