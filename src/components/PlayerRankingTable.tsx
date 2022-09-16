import Image from 'next/image';
import { trpc } from '../utils/trpc';
export default function PlayerRankingTable() {
  const rankings = trpc.useQuery(['game.ranking.get', { skip: 0, take: 10 }]);
  return (
    <div className="relative w-full sm:max-w-md bg-white p-2">
      <h5 className="ml-4 mb-4 text-2xl font-bold tracking-tight text-gray-900 ">
        Rankings
      </h5>
      <table className="w-full table">
        <thead className="text-white uppercase text-sm">
          <tr className="text-left">
            <th className="bg-gray-900">Player</th>
            <th className="bg-gray-900">Rating</th>
            <th className="bg-gray-900">Record</th>
          </tr>
        </thead>
        <tbody className="bg-white">
          {rankings.data?.map((user) => (
            <tr key={user.id} className="p-4">
              <td>
                <div className="flex flex-row items-center gap-2">
                  <div className="avatar">
                    <div className="w-10 mask mask-squircle">
                      <Image layout="fill" src={user.image!} alt={user.name!} />
                    </div>
                  </div>
                  <div>
                    <div className="text font-medium text-gray-900">
                      {user.name}
                    </div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </div>
                </div>
              </td>
              <td className="font-mono">{Math.round(user.rating)}</td>
              <td className="font-mono">
                {user._count.wins} - {user._count.losses}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
