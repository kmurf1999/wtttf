import type { GameInviteNotification as GameInviteNotificationType } from "../../providers/NotifcationProvider";
import { useNotificationStore } from "../../providers/NotifcationProvider";
import GameInviteNotification from "./GameInviteNotification";

export default function NotificationCenter() {
  const notifications = useNotificationStore((state) => state.notifications);
  return (
    <div className="fixed top-20 sm:right-4">
      <ul className="flex flex-col gap-2">
        {notifications.map((notification) => {
          if (notification.type === "GameInvite") {
            return (
              <GameInviteNotification
                key={notification.id}
                id={notification.id}
                data={notification.data as GameInviteNotificationType}
              />
            );
          }

          return null;
        })}
      </ul>
    </div>
  );
}
