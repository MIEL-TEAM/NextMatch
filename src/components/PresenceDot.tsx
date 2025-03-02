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
      <div className="relative" title="מחובר/ת">
        <GoDot
          size={36}
          className="fill-white z-10 absolute -top-[2px] -right-[2px]"
        />
        <GoDotFill
          size={32}
          className="fill-[#007A33] border-2 border-white rounded-full animate-pulse z-20 cursor-pointer"
        />
      </div>
    </>
  );
}
