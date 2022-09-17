import { ChevronUpDownIcon } from '@heroicons/react/24/solid';
import Image from 'next/image';
import { trpc } from '../utils/trpc';
export default function PlayerRankingTable() {
  const rankings = trpc.useQuery(['game.ranking.get', { skip: 0, take: 30 }]);
  return (
    <div className="relative w-full sm:mx-auto sm:max-w-md ">
      <h3 className="p-2 font-medium text-white bg-gray-900">Rankings</h3>
      <div className="relative overflow-x-auto border-t">
        <table className="w-full text-sm text-left text-gray-500 ">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 ">
            <tr>
              <th scope="col" className="py-3 px-2">
                Player
              </th>
              <th scope="col" className="py-3 px-2">
                <div className="flex items-center">
                  Rating
                  <ChevronUpDownIcon className="ml-1 w-4 h-4" />
                </div>
              </th>
              <th scope="col" className="py-3 px-2">
                <div className="flex items-center">
                  Record
                  <ChevronUpDownIcon className="ml-1 w-4 h-4" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {rankings.data?.map((player) => (
              <tr key={player.id} className="bg-white border-b">
                <td
                  scope="row"
                  className="py-4 px-2 font-medium text-gray-900 whitespace-nowrap flex flex-row gap-2"
                >
                  <div className="avatar">
                    <div className="sm:w-10 mask mask-squircle">
                      <Image layout="fill" src={player.image!} alt="avatar" />
                    </div>
                  </div>
                  <div>
                    <div>{player.name}</div>
                    <div className="text-sm overflow-hidden text-ellipsis max-w-[160px] text-gray-400 font-normal">
                      {player.email}
                    </div>
                  </div>
                </td>
                <td className="py-4 px-2 font-mono text-base">
                  {Math.round(player.rating)}
                </td>
                <td className="py-4 px-2 font-mono text-base">
                  {player._count.wins} - {player._count.losses}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
