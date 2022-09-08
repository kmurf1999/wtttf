import { ArrowRightIcon } from "@heroicons/react/24/solid";
import { NextPage } from "next";
import Image from "next/image";
import { useState } from "react";
import Layout from "../../components/Layout";
import SearchInput from "../../components/SearchInput";
import { trpc } from "../../utils/trpc";

const Create: NextPage = () => {
  const [name, setName] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const players = trpc.useQuery(["auth.getUsersByName", { name }]);

  return (
    <Layout>
      <div
        style={{ width: 800 }}
        className="p-6 flex flex-col gap-3 max-w-sm bg-white rounded-lg border border-gray-200 shadow-md dark:bg-gray-800 dark:border-gray-700"
      >
        <h5 className="text-lg font-bold tracking-tight text-gray-900 dark:text-white">
          Create game
        </h5>
        <div className="text-gray-400">Search Players</div>
        <SearchInput
          placeholder="Player name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <div className="text-gray-400">Players</div>
        <ul className="h-60 overflow-y-auto bg-gray-50 border border-gray-300 rounded-lg flex flex-col ">
          {players.data?.map((player) => (
            <li key={player.id}>
              <button
                className="w-full p-4 flex flex-row gap-2 hover:bg-gray-100"
                onClick={() => setSelectedUserId(player.id)}
              >
                <div className="avatar online mr-2">
                  <div className="w-12 mask mask-circle">
                    <Image layout="fill" src={player.image!} alt="Avatar" />
                  </div>
                </div>
                <div className="text-start">
                  <span className="font-medium text-gray-800">
                    {player.name}
                  </span>
                  <span className="ml-2 text-gray-600 font-mono">
                    ({player.rating})
                  </span>
                  <div className="text-gray-500 text-sm">{player.email}</div>
                </div>
              </button>
            </li>
          ))}
        </ul>

        <div className="w-full flex flex-row justify-end">
          <button className="btn btn-primary" disabled={!selectedUserId}>
            Send
            <ArrowRightIcon className="w-5 h-5 ml-2" />
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default Create;
