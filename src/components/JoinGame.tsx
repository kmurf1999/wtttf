import { CheckCircleIcon } from "@heroicons/react/24/solid";
import { useState } from "react";
import Modal from "../components/Modal";
import { trpc } from "../utils/trpc";

const JoinGame = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const closeModal = () => setModalOpen(false);
  const openModal = () => setModalOpen(true);

  const [inviteId, setInviteId] = useState<string | null>(null);
  const invites = trpc.useQuery(["auth.getReceivedInvites"]);
  const utils = trpc.useContext();

  const joinGame = trpc.useMutation(["auth.joinGame"], {
    onSuccess: () => {
      utils.invalidateQueries(["auth.getReceivedInvites"]);
      utils.invalidateQueries(["auth.getGameInProgress"]);
    },
  });

  const onSubmit = () => {
    if (inviteId) {
      joinGame.mutateAsync({ inviteId });
    }
  };

  console.log(invites.data, invites.status);

  return (
    <>
      <button onClick={openModal} className="btn btn-lg">
        Join Game
      </button>
      <Modal
        isOpen={modalOpen}
        close={closeModal}
        actions={[
          {
            label: "Join",
            onClick: onSubmit,
            variant: "primary",
            disabled: !inviteId,
          },
          { label: "Cancel", onClick: closeModal },
        ]}
      >
        <>
          <div>
            <h2 className="text-2xl font-bold">Join Game</h2>
            <p className="text-lg">Select a game invite below</p>
          </div>
          <ul className="w-full border bg-gray-50 rounded-lg overflow-none py-1 h-40 overflow-y-auto">
            {invites.data?.map((invite) => (
              <li key={invite.id}>
                <button
                  onClick={() => setInviteId(invite.id)}
                  className="px-4 py-3 w-full text-lg flex flex-row items-center gap-4 hover:bg-gray-100"
                >
                  {invite.from.name} invited you to a game
                  <div className="grow" />
                  {inviteId === invite.id && (
                    <CheckCircleIcon className="w-6 text-green-400" />
                  )}
                </button>
              </li>
            ))}
          </ul>
        </>
      </Modal>
    </>
  );
};

export default JoinGame;
