import {
  ArrowLeftIcon,
  ArrowPathIcon,
  ArrowRightIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";
import { NextPage } from "next";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import Layout from "../../components/Layout";
import { trpc } from "../../utils/trpc";

const Join: NextPage = () => {
  const router = useRouter();
  const ctx = trpc.useContext();
  const invites = trpc.useQuery(["game.invite.getReceivedInvites"]);
  const declineInvite = trpc.useMutation(["game.invite.declineInvite"], {
    onSuccess: (data) => {
      if (selectedInviteId === data.id) {
        setSelectedInviteId(null);
      }
      ctx.invalidateQueries(["game.invite.getReceivedInvites"]);
    },
  });
  const acceptInvite = trpc.useMutation(["game.invite.acceptInvite"], {
    onSuccess: (game) => {
      ctx.invalidateQueries(["game.invite.getReceivedInvites"]);
      router.push(`/play/${game.id}`);
    },
  });
  const [selectedInviteId, setSelectedInviteId] = useState<string | null>(null);
  return (
    <Layout>
      <div
        style={{ width: 600 }}
        className="p-6 flex flex-col gap-3 bg-white rounded-lg border border-gray-200 shadow-md dark:bg-gray-800 dark:border-gray-700"
      >
        <div className="flex flex-row items-center gap-2">
          <Link href="/">
            <a className="btn btn-sm btn-ghost btn-circle">
              <ArrowLeftIcon className="h-5" />
            </a>
          </Link>
          <h5 className="text-lg font-bold tracking-tight text-gray-900 dark:text-white">
            Join Game
          </h5>
        </div>
        <div className="text-gray-400">
          Pending invites{" "}
          <button
            className="ml-2 inline-flex btn btn-sm btn-ghost"
            onClick={() => invites.refetch()}
          >
            Refresh
            <ArrowPathIcon className="ml-2 w-5" />
          </button>
        </div>
        <ul className="h-60 overflow-y-auto bg-gray-50 border border-gray-300 rounded-lg flex flex-col ">
          {invites.data?.map((invite) => (
            <li key={invite.id} className="relative">
              {invite.id === selectedInviteId && (
                <div className="absolute w-1 h-full bg-purple-500 l-0 t-0" />
              )}
              <button
                className={[
                  "w-full p-4 flex flex-row items-center",
                  selectedInviteId === invite.id
                    ? "bg-purple-100"
                    : "hover:bg-gray-100",
                ].join(" ")}
                onClick={() => setSelectedInviteId(invite.id)}
              >
                <div className="avatar online mr-2">
                  <div className="w-12 mask mask-circle">
                    <Image
                      layout="fill"
                      src={invite.from.image!}
                      alt="Avatar"
                    />
                  </div>
                </div>
                <div className="text-start">
                  <span className="font-medium text-gray-800">
                    {invite.from.name}
                  </span>
                  <span className="ml-2 text-gray-600 font-mono">
                    ({invite.from.rating})
                  </span>
                  <div className="text-gray-500 text-sm">
                    {invite.from.email}
                  </div>
                </div>
                <div className="grow" />
                <button
                  className="btn btn-sm btn-ghost w-10 h-10 p-2 text-gray-400 hover:text-red-600"
                  onClick={() => declineInvite.mutate({ inviteId: invite.id })}
                >
                  <XMarkIcon className="w-full" />
                </button>
              </button>
            </li>
          ))}
        </ul>
        <div className="mt-4 w-full flex flex-row justify-end">
          <button
            onClick={() => acceptInvite.mutate({ inviteId: selectedInviteId! })}
            className="btn btn-primary"
            disabled={!selectedInviteId}
          >
            Send
            <ArrowRightIcon className="w-5 h-5 ml-2" />
          </button>
        </div>
      </div>
    </Layout>
  );
};
export default Join;
