import { CheckCircleIcon } from "@heroicons/react/24/solid";
import { useState } from "react";
import Modal from "../components/Modal";
import { trpc } from "../utils/trpc";
import PlayerCard from "./PlayerCard";

const JoinGame = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const closeModal = () => setModalOpen(false);
  const openModal = () => setModalOpen(true);

  const invites = trpc.useQuery(["auth.getReceivedInvites"]);
  const utils = trpc.useContext();

  const rejectInvite = trpc.useMutation(["auth.declineInvite"], {
    onSuccess: () => {
      utils.invalidateQueries(["auth.getReceivedInvites"]);
    },
  });

  const joinGame = trpc.useMutation(["auth.joinGame"], {
    onSuccess: () => {
      utils.invalidateQueries(["auth.getReceivedInvites"]);
      utils.invalidateQueries(["auth.getGameInProgress"]);
    },
  });

  return (
    <>
      <button onClick={openModal} className="btn btn-lg">
        Join Game
      </button>
      <Modal
        isOpen={modalOpen}
        close={closeModal}
        actions={[{ label: "Cancel", onClick: closeModal }]}
      >
        <>
          <div>
            <h2 className="text-2xl font-bold">Join Game</h2>
            <p className="text-lg">Select a game invite below</p>
          </div>
          <ul className="w-full border bg-gray-50 rounded-lg overflow-none h-80 overflow-y-auto">
            {invites.data?.map((invite) => (
              <li key={invite.id}>
                <div className="px-4 py-3 w-full text-lg flex flex-row items-center gap-4 border-b">
                  <PlayerCard
                    name={invite.from.name!}
                    image={invite.from.image!}
                    elo={invite.from.elo}
                    // selected={invite.id === inviteId}
                  />
                  <button
                    onClick={() =>
                      rejectInvite.mutateAsync({ inviteId: invite.id })
                    }
                    className="btn btn-outline btn-sm btn-error"
                  >
                    Decline
                  </button>
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={() =>
                      joinGame.mutateAsync({ inviteId: invite.id })
                    }
                  >
                    Accept
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </>
      </Modal>
    </>
  );
};

export default JoinGame;
