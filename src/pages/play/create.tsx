import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/solid';
import Cookies from 'cookies';
import { GetServerSidePropsContext, NextPage } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import WaitingModal from '../../components/create/WaitingModal';
import Layout from '../../components/Layout';
import SearchInput from '../../components/SearchInput';
import { getServerAuthSession } from '../../server/common/get-server-auth-session';
import { trpc } from '../../utils/trpc';

const Create: NextPage = () => {
  const [name, setName] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [inviteId, setInviteId] = useState<string | null>(null);
  const router = useRouter();

  const players = trpc.useQuery(['auth.getUsersByName', { name }]);
  const createGame = trpc.useMutation(['game.invite.sendInvite'], {
    onSuccess: (data) => {
      setSelectedUserId(null);
      setInviteId(data.id);
    },
  });
  const cancelInvite = trpc.useMutation(['game.invite.cancelInvite'], {
    onSuccess: () => {
      setInviteId(null);
    },
  });

  trpc.useSubscription(['game.invite.streamAcceptedInvites'], {
    onNext: (data) => {
      router.push(`/play/${data.id}`);
    },
  });

  const showModal = inviteId !== null;

  return (
    <Layout>
      {showModal && (
        <WaitingModal
          close={() => {
            cancelInvite.mutate({ inviteId });
          }}
        />
      )}
      <div className="w-full sm:mx-auto sm:max-w-md flex flex-col gap-2">
        <Link href="/">
          <a className=" mt-2 w-fit btn btn-sm btn-ghost text-gray-400 ">
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to home
          </a>
        </Link>
        <div className="w-full p-6 flex flex-col gap-3 bg-white sm:rounded border-b border-t sm:border border-gray-200 sm:shadow-md">
          <h5 className="text-lg font-bold tracking-tight text-gray-900 ">
            Create Game
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
              <li key={player.id} className="relative">
                {player.id === selectedUserId && (
                  <div className="absolute w-1 h-full bg-blue-500 l-0 t-0" />
                )}
                <button
                  className={[
                    'w-full p-4 flex flex-row gap-2 ',
                    selectedUserId === player.id
                      ? 'bg-blue-100'
                      : 'hover:bg-gray-100',
                  ].join(' ')}
                  onClick={() => setSelectedUserId(player.id)}
                >
                  <div className="avatar mr-2">
                    <div className="w-12 mask mask-circle">
                      <Image layout="fill" src={player.image} alt="Avatar" />
                    </div>
                  </div>
                  <div className="text-start">
                    <span className="font-medium text-gray-800">
                      {player.name}
                    </span>
                    <span className="ml-2 text-gray-600 font-mono">
                      ({Math.round(player.rating)})
                    </span>
                    <div className="text-gray-500 text-sm text-ellipsis">
                      {player.email}
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>

          <div className="mt-4 w-full flex flex-row justify-end">
            <button
              onClick={() => {
                if (selectedUserId) {
                  createGame.mutate({ otherPlayerId: selectedUserId });
                }
              }}
              className="btn btn-primary bg-blue-500 border-none"
              disabled={!selectedUserId}
            >
              Send
              <ArrowRightIcon className="w-5 h-5 ml-2" />
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export async function getServerSideProps(context: {
  req: GetServerSidePropsContext['req'];
  res: GetServerSidePropsContext['res'];
}) {
  const session = await getServerAuthSession(context);

  if (!session) {
    const cookies = new Cookies(context.req, context.res);
    cookies.set('destination', '/play/create');
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  return {
    props: { session },
  };
}

export default Create;
