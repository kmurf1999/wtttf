import { useState } from 'react';
import { trpc } from '../utils/trpc';
import WaitingModal from './create/WaitingModal';

export default function ChallengePlayer({ userId }: { userId: string }) {
  const [inviteId, setInviteId] = useState<string | null>(null);
  const createGame = trpc.useMutation(['game.invite.sendInvite'], {
    onSuccess: (data) => {
      setInviteId(data.id);
    },
  });
  const cancelInvite = trpc.useMutation(['game.invite.cancelInvite'], {
    onSuccess: () => {
      setInviteId(null);
    },
  });
  return (
    <>
      {inviteId && (
        <WaitingModal close={() => cancelInvite.mutate({ inviteId })} />
      )}
      <button
        className="btn btn-sm bg-blue-500 border-none text-white"
        onClick={() => createGame.mutate({ otherPlayerId: userId })}
      >
        Challenge
      </button>
    </>
  );
}
