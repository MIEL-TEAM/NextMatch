import React from "react";
import ListsTab from "./ListsTab";
import {
  fetchCurrentUserLikeIds,
  fetchLikedMembers,
} from "../actions/likeActions";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "התאמות אישיות | Miel",
  description:
    "צפה בכל החיבורים וההתאמות האישיות שלך, גלה את מי סימנת בלייק ומי עשוי להתאים לך.",
  openGraph: {
    title: "התאמות אישיות | Miel",
    description:
      "צפה בכל החיבורים וההתאמות האישיות שלך, גלה את מי סימנת בלייק ומי עשוי להתאים לך.",
    url: "https://miel-love.com/lists",
    locale: "he_IL",
    type: "website",
    images: [
      {
        url: "https://miel-love.com/images/social-share.png",
        width: 1200,
        height: 630,
        alt: "התאמות אישיות | Miel",
      },
    ],
  },
  alternates: {
    canonical: "https://miel-love.com/lists",
  },
};

export default async function ListsPage({
  searchParams: searchParamsPromise,
}: {
  searchParams: Promise<{ type: string }>;
}) {
  const searchParams = await searchParamsPromise;

  const likeIds = await fetchCurrentUserLikeIds();
  const members = await fetchLikedMembers(searchParams.type);

  return (
    <div className="w-full max-w-screen-2xl mx-auto px-2 md:px-4 py-2 md:py-4">
      <ListsTab members={members} likeIds={likeIds} />
    </div>
  );
}
