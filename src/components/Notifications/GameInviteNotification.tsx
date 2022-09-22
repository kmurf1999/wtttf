import { useRouter } from 'next/router';
import {
  GameInviteNotification as GameInviteNotificationType,
  useNotificationStore,
} from '../../providers/NotifcationProvider';
import { trpc } from '../../utils/trpc';

export default function GameInviteNotification({
  id,
  data: {
    id: inviteId,
    from: { name },
  },
}: {
  id: string;
  data: GameInviteNotificationType;
}) {
  const router = useRouter();
  const acceptInvite = trpc.useMutation(['game.invite.acceptInvite'], {
    onSuccess: (data) => {
      router.push(`/play/${data.id}`);
    },
  });
  const declineInvite = trpc.useMutation(['game.invite.declineInvite']);
  const closeNotification = useNotificationStore(
    (state) => state.closeNotification,
  );

  return (
    <div
      className="p-4 w-full max-w-xs text-gray-500 bg-white rounded-lg shadow-lg "
      role="alert"
    >
      <div className="flex">
        <div className="inline-flex flex-shrink-0 justify-center items-center w-8 h-8 text-blue-500 bg-blue-100 rounded-lg ">
          <svg
            aria-hidden="true"
            className="w-5 h-5"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
              clipRule="evenodd"
            ></path>
          </svg>
          <span className="sr-only">Refresh icon</span>
        </div>
        <div className="ml-3 text-sm font-normal">
          <span className="mb-1 text-sm font-semibold text-gray-900 ">
            Game Invitation
          </span>
          <div className="mt-1 mb-2 text-sm font-normal">
            <span className="text font-bold text-gray-600">{name}</span> has
            invited you to a game.
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            <div>
              <button
                className="inline-flex justify-center w-full px-2 py-1.5 text-xs font-medium text-center text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 "
                onClick={() => {
                  acceptInvite.mutate({ inviteId });
                  closeNotification(id);
                }}
              >
                Accept
              </button>
            </div>
            <div>
              <button
                className="inline-flex justify-center w-full px-2 py-1.5 text-xs font-medium text-center text-gray-900 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-200 "
                onClick={() => {
                  declineInvite.mutate({ inviteId });
                  closeNotification(id);
                }}
              >
                Decline
              </button>
            </div>
          </div>
        </div>
        <button
          type="button"
          className="ml-auto -mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex h-8 w-8 "
          data-dismiss-target="#toast-interactive"
          aria-label="Close"
          onClick={() => closeNotification(id)}
        >
          <span className="sr-only">Close</span>
          <svg
            aria-hidden="true"
            className="w-5 h-5"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            ></path>
          </svg>
        </button>
      </div>
    </div>
  );
}
