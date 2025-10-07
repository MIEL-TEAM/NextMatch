import usePresenceStore from "@/hooks/usePresenceStore";
import { Member } from "@prisma/client";
import { GoDot, GoDotFill } from "react-icons/go";

type PresenceProps = {
  member: Member;
};
export default function PresenceDot({ member }: PresenceProps) {
  const members = usePresenceStore((state) => state.members);

  const isOnline = members.indexOf(member.userId) !== -1;

  // Always render a presence indicator: gray by default, green when online
  return (
    <div
      className="relative"
      title={isOnline ? "מחובר/ת" : "לא מחובר/ת"}
      aria-label={isOnline ? "online" : "offline"}
    >
      <GoDot
        size={36}
        className="fill-white z-10 absolute -top-[2px] -right-[2px]"
      />
      <GoDotFill
        size={32}
        className={`${
          isOnline ? "fill-[#007A33] animate-pulse" : "fill-gray-400"
        } border-2 border-white rounded-full z-20`}
      />
    </div>
  );
}
