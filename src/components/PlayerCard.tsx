import { CheckCircleIcon } from "@heroicons/react/24/solid";
import Image from "next/image";

export default function PlayerCard({
  name,
  image,
  elo,
  selected = false,
}: {
  name: string;
  image: string;
  elo: number;
  selected?: boolean;
}) {
  return (
    <div
      key={name}
      className="rounded-lg flex flex-row items-center gap-4 w-full"
    >
      <div className="avatar">
        <div className="w-16 mask mask-squircle">
          <Image layout="fill" src={image} alt="Avatar" />
        </div>
      </div>
      <div>
        <div className="text-xl font-bold">{name}</div>
        <div className="text-lg text-start">
          Rating <b>{elo}</b>
        </div>
      </div>
      <div className="flex-grow" />
      {selected && <CheckCircleIcon className="text-green-500 w-6" />}
    </div>
  );
}
