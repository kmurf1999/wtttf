import type { GameInviteNotification as GameInviteNotificationType } from '../../providers/NotifcationProvider';
import { useNotificationStore } from '../../providers/NotifcationProvider';
import GameInviteNotification from './GameInviteNotification';

export default function NotificationCenter() {
  const notifications = useNotificationStore((state) => state.notifications);
  return (
    <ul className="z-10 fixed top-20 mx-auto left-0 right-0 sm:left-auto sm:right-4 flex flex-col gap-2 w-fit">
      {notifications.map((notification) => {
        if (notification.type === 'GameInvite') {
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
  );
}
