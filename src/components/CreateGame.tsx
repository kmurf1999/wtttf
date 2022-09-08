import { useState } from "react";
import Modal from "../components/Modal";
import SearchInput from "../components/SearchInput";
import { trpc } from "../utils/trpc";
import PlayerCard from "./PlayerCard";

const SelectPlayer = ({
  setUserId,
  userId,
}: {
  userId: string;
  setUserId: (id: string) => void;
}) => {
  const [name, setName] = useState("");
  const users = trpc.useQuery(["auth.getUsersByName", { name }]);
  return (
    <>
      <div>
        <h2 className="text-2xl font-bold">Create Game</h2>
        <p className="text-lg">Search for a player to invite to a game</p>
      </div>
      <SearchInput
        placeholder="Player name"
        value={name}
        onSubmit={() => {
          return 0;
        }}
        onChange={(e) => setName(e.target.value)}
      />
      <ul className="w-full border rounded-lg overflow-none  h-80 overflow-y-auto">
        {users.data?.map((user) => (
          <li key={user.id}>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setUserId(user.id);
              }}
              className="px-4 py-3 w-full text-lg flex flex-row items-center gap-4 hover:bg-gray-100 border-b"
            >
              <PlayerCard
                selected={user.id === userId}
                name={user.name!}
                image={user.image!}
                elo={user.elo}
              />
            </button>
          </li>
        ))}
      </ul>
    </>
  );
};

const CreateGame = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const closeModal = () => setModalOpen(false);
  const openModal = () => setModalOpen(true);

  const [selectedUserId, setSelectedUserId] = useState<string>("");

  const createGame = trpc.useMutation(["auth.createGame"]);
  const utils = trpc.useContext();

  const sendInvite = () => {
    if (selectedUserId) {
      createGame.mutate(
        { otherPlayerId: selectedUserId },
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
      <button onClick={openModal} className="btn btn-primary">
        Create game
      </button>
      <Modal
        isOpen={modalOpen}
        close={closeModal}
        actions={[
          {
            label: "Create",
            onClick: sendInvite,
            variant: "primary",
            disabled: !selectedUserId,
          },
          { label: "Cancel", onClick: closeModal },
        ]}
      >
        <SelectPlayer userId={selectedUserId} setUserId={setSelectedUserId} />
      </Modal>
    </>
  );
};

export default CreateGame;
