import {
  CheckCircleIcon,
  CheckIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";
import Image from "next/image";
import { useState } from "react";
import Modal from "../components/Modal";
import { trpc } from "../utils/trpc";
import PlayerCard from "./PlayerCard";

function timeSince(date: number) {
  const seconds = Math.floor((Date.now() - date) / 1000);

  let interval = seconds / 31536000;

  if (interval > 1) {
    return Math.floor(interval) + " years";
  }
  interval = seconds / 2592000;
  if (interval > 1) {
    return Math.floor(interval) + " months";
  }
  interval = seconds / 86400;
  if (interval > 1) {
    return Math.floor(interval) + " days";
  }
  interval = seconds / 3600;
  if (interval > 1) {
    return Math.floor(interval) + " hours";
  }
  interval = seconds / 60;
  if (interval > 1) {
    return Math.floor(interval) + " minutes";
  }
  return Math.floor(seconds) + " seconds";
}

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
      <button onClick={openModal} className="btn btn-outline btn-primary">
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
          <ul className="w-full border rounded-lg overflow-none h-80 overflow-y-auto">
            {invites.data?.map((invite) => (
              <li key={invite.id}>
                <div className="relative w-full h-16 text-lg flex items-center flex-row border-b">
                  <div className="flex flex-row grow p-2 gap-2">
                    <div className="avatar w-0 sm:w-10">
                      <div className="mask mask-circle">
                        <Image
                          layout="fill"
                          src={invite.from.image!}
                          alt="Avatar"
                        />
                      </div>
                    </div>
                    <div>
                      <div className="text-black/[0.85] ">
                        {invite.from.name}
                        <span className="ml-4 text-sm text-black/[0.45] ">
                          {timeSince(invite.date.getTime())} ago
                        </span>
                      </div>
                      <div className="text-black/[0.45] text-sm font-mono">
                        {invite.from.rating} <b>ELO</b>
                      </div>
                    </div>
                    <div className="flex-grow" />
                  </div>
                  <button
                    onClick={() =>
                      rejectInvite.mutateAsync({ inviteId: invite.id })
                    }
                    className="h-full w-16 bg-red-400 flex items-center justify-center"
                  >
                    <XMarkIcon className="h-8 text-white" />
                  </button>
                  <button
                    className="h-full w-16 bg-blue-500 flex items-center justify-center"
                    onClick={() =>
                      joinGame.mutateAsync({ inviteId: invite.id })
                    }
                  >
                    <CheckIcon className="h-8 text-white" />
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
