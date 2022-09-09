import { inferSubscriptionOutput } from "@trpc/server";
import create from "zustand";
import { AppRouter } from "../server/router";

const NOTIFICATION_TIMEOUT = 10000; // 10 seconds

export type NotifcationType = "GameInvite";

export type GameInviteNotification = inferSubscriptionOutput<
  AppRouter,
  "game.invite.streamReceivedInvites"
>;

type Notification = {
  id: string;
  data: GameInviteNotification;
  type: NotifcationType;
};

interface NotificationStore {
  notifications: Notification[];
  closeNotification: (id: string) => void;
  pushNotification: (notification: Omit<Notification, "id">) => void;
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [],
  closeNotification: (id: string) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }));
  },
  pushNotification: (notification: Omit<Notification, "id">) => {
    const id = Math.random().toString(36).substring(2, 9);
    set((state) => ({
      notifications: [...state.notifications, { ...notification, id }],
    }));
    setTimeout(() => {
      set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== id),
      }));
    }, NOTIFICATION_TIMEOUT);
  },
}));
