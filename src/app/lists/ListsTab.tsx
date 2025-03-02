"use client";

import { useEffect, useState, Key, useTransition } from "react";
import { Spinner, Tab, Tabs } from "@nextui-org/react";
import { Member, Photo } from "@prisma/client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import MemberCard from "../members/MemberCard";
import { getMemberPhotos } from "../actions/memberActions";
import { toast } from "react-toastify";

type ListsProps = {
  members: Member[];
  likeIds: string[];
};

const tabs = [
  { id: "source", label: "החברים שאהבתי" },
  { id: "target", label: "החברים שאהבו אותי" },
  { id: "mutual", label: "לייקים הדדיים" },
];

export default function ListsTab({ members, likeIds }: ListsProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [membersWithPhotos, setMembersWithPhotos] = useState<
    { member: Member; photos: Photo[] }[]
  >([]);
  const [status, setStatus] = useState<"loading" | "error" | "success">(
    "loading"
  );

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        setStatus("loading");
        const data = await Promise.all(
          members.map(async (member) => ({
            member,
            photos: (await getMemberPhotos(member.userId)) || [],
          }))
        );
        setMembersWithPhotos(data);
        setStatus("success");
      } catch (err) {
        console.error("שגיאה בטעינת המשתמשים", err);
        toast.error("⚠️ לא ניתן לטעון את רשימת המשתמשים. נסה שוב מאוחר יותר.");
        setStatus("error");
      }
    };

    fetchPhotos();
  }, [members]);

  const handleTabChange = (key: Key) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams);
      params.set("type", key.toString());
      router.replace(`${pathname}?${params.toString()}`);
    });
  };

  if (status === "loading") {
    return (
      <Spinner color="secondary" className="self-center ml-3 mt-6" size="lg" />
    );
  }

  if (status === "error") {
    return (
      <div className="text-center text-red-500 mt-6">
        ⚠️ אירעה שגיאה בטעינת הנתונים. נסה שוב מאוחר יותר.
      </div>
    );
  }

  const selectedTab = searchParams.get("type") || tabs[0].id;

  return (
    <div className="flex w-full flex-col mt-4 md:mt-10 gap-3 md:gap-5 px-2 md:px-4">
      <div className="flex items-center overflow-x-auto">
        <Tabs
          aria-label="Like Tabs"
          color="secondary"
          selectedKey={selectedTab}
          onSelectionChange={handleTabChange}
          className="w-full"
          size="sm"
        >
          {tabs.map((item) => (
            <Tab
              key={item.id}
              title={
                <span className="text-xs md:text-sm whitespace-nowrap">
                  {item.label}
                </span>
              }
            />
          ))}
        </Tabs>
        {isPending && (
          <Spinner color="secondary" className="self-center ml-3" size="sm" />
        )}
      </div>

      <div className="w-full">
        {membersWithPhotos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
            {membersWithPhotos.map(({ member, photos }) => (
              <MemberCard
                key={member.id}
                member={member}
                likeIds={likeIds}
                photos={photos}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-sm md:text-base">
            ❌ אין עדיין לייקים.
          </div>
        )}
      </div>
    </div>
  );
}
