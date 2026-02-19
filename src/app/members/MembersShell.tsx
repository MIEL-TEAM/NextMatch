"use client";

import { useSession } from "next-auth/react";
import { StoriesContainer } from "@/components/stories/StoriesContainer";
import { ReactNode } from "react";

export default function MembersShell({
    children,
}: {
    children: ReactNode;
}) {
    const { data: session } = useSession();

    return (
        <>
            {session?.user?.id && (
                <div className="mb-8 relative">
                    <div className="w-screen px-2 pt-4">
                        <StoriesContainer currentUserId={session.user.id} />
                    </div>
                </div>
            )}

            {children}
        </>
    );
}
