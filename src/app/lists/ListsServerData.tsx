import { fetchCurrentUserLikeIds, fetchLikedMembers } from "@/app/actions/likeActions";
import { getMembersWithPhotos } from "@/app/actions/memberActions";
import ListsTab from "./ListsTab";

const VALID_TYPES = ["source", "target", "mutual"] as const;
type ListType = (typeof VALID_TYPES)[number];

interface ListsServerDataProps {
  type: string;
}

export default async function ListsServerData({ type }: ListsServerDataProps) {
  const validType: ListType = VALID_TYPES.includes(type as ListType)
    ? (type as ListType)
    : "source";

  const [likeIds, members] = await Promise.all([
    fetchCurrentUserLikeIds(),
    fetchLikedMembers(validType),
  ]);

  const memberIds = members.map((m) => m.userId);
  const photosByUserId = await getMembersWithPhotos(memberIds);

  const membersData = members.map((member) => {
    const photos = photosByUserId[member.userId] ?? [];
    const processedPhotos: { url: string; id: string }[] = [];

    if (member.image) {
      processedPhotos.push({ url: member.image, id: "profile" });
    }

    for (const photo of photos) {
      if (photo.url && !processedPhotos.some((p) => p.url === photo.url)) {
        processedPhotos.push({ url: photo.url, id: photo.id });
      }
    }

    return { member, processedPhotos };
  });

  return <ListsTab membersData={membersData} likeIds={likeIds} />;
}
