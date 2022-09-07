import { CheckCircleIcon } from "@heroicons/react/24/solid";
import { useState } from "react";
import Modal from "../components/Modal";
import SearchInput from "../components/SearchInput";
import { trpc } from "../utils/trpc";
import Image from "next/image";
import PlayerCard from "./PlayerCard";

const CreateGame = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const closeModal = () => setModalOpen(false);
  const openModal = () => setModalOpen(true);

  const [name, setName] = useState("");
  const [id, setId] = useState<string | null>();

  const users = trpc.useQuery(["auth.getUsersByName", { name }]);
  const createGame = trpc.useMutation(["auth.createGame"]);
  const utils = trpc.useContext();

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  const onSubmit = () => {
    if (id) {
      createGame.mutate(
        { otherPlayerId: id },
        {
          onSuccess: () => {
            utils.invalidateQueries(["auth.getReceivedInvites"]);
            utils.invalidateQueries(["auth.getGameInProgress"]);
          },
        }
      );
    }
  };

  return (
    <>
      <button onClick={openModal} className="btn btn-lg">
        Create Game
      </button>
      <Modal
        isOpen={modalOpen}
        close={closeModal}
        actions={[
          {
            label: "Create",
            onClick: onSubmit,
            variant: "primary",
            disabled: !id,
          },
          { label: "Cancel", onClick: closeModal },
        ]}
      >
        <>
          <div>
            <h2 className="text-2xl font-bold">Create Game</h2>
            <p className="text-lg">Search for a player to invite to a game</p>
          </div>
          <SearchInput
            placeholder="Player name"
            value={name}
            onSubmit={() => setId(users.data?.[0]?.id)}
            onChange={onChange}
          />
          <ul className="w-full border bg-gray-50 rounded-lg overflow-none  h-80 overflow-y-auto">
            {users.data?.map((user) => (
              <li key={user.id}>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setId(user.id);
                  }}
                  className="px-4 py-3 w-full text-lg flex flex-row items-center gap-4 hover:bg-gray-100 border-b"
                >
                  <PlayerCard
                    selected={user.id === id}
                    name={user.name!}
                    image={user.image!}
                    elo={user.elo}
                  />
                </button>
              </li>
            ))}
          </ul>
        </>
      </Modal>
    </>
  );
};

export default CreateGame;
