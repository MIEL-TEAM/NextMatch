import usePresenceStore from "@/hooks/usePresenceStore";
import { Member } from "@prisma/client";
import { GoDot, GoDotFill } from "react-icons/go";

type PresenceProps = {
  member: Member;
};
export default function PresenceDot({ member }: PresenceProps) {
  const members = usePresenceStore((state) => state.members);

  const isOnline = members.indexOf(member.userId) !== -1;

  if (!isOnline) return null;
  return (
    <>
      <GoDot
        size={36}
        className="fill-white absolute -top-[2px] -right-[2px]"
      />
      <GoDotFill size={32} className="fill-green-500 animate-pulse" />
    </>
  );
}
