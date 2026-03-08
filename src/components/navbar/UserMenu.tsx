"use client";

import { signOutUser } from "@/app/actions/authActions";
import {
  Avatar,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownSection,
  DropdownTrigger,
} from "@nextui-org/react";
import Link from "next/link";
import React, { useState } from "react";
import useConversationStore from "@/store/conversationStore";
import useNotificationStore from "@/store/notificationStore";
import Icon from "@/lib/table/Icon";
import { AIChatModal } from "@/components/ai-assistant/AIChatModal";
import type { UserMenuProps } from "@/types/navigation";

export default function UserMenu({
  userInfo,
  userId,
  isAdmin = false,
  isPremium = false,
  profileCompletion,
}: UserMenuProps) {

  const [isAIModalOpen, setIsAIModalOpen] = useState(false);

  if (!userId) {
    return null;
  }

  const incompleteTasks = profileCompletion?.tasks.filter((task: any) => !task.completed) || [];
  const recommended = profileCompletion?.recommendedAction ?? incompleteTasks[0] ?? null;

  return (
    <>
      <Dropdown placement="bottom-end">
        <DropdownTrigger>
          <Avatar
            as="button"

            className="
      border-2 border-white rounded-full
      outline outline-2 outline-black bg-black
      !w-10 !h-10     
      sm:!w-10 sm:!h-10   
      sm:transition-transform
      sm:hover:scale-105
      sm:active:scale-95
    "
            name={userInfo?.name || 'user avatar'}
            size="sm"
            src={userInfo?.image || '/images/user.png'}
          />
        </DropdownTrigger>


        <DropdownMenu variant="flat" aria-label="User actions menu">
          <DropdownSection showDivider>
            <DropdownItem
              key="username-display"
              aria-label="username"
              isReadOnly
              as="span"
              className="h-auto flex flex-row py-2"
            >
              <div>
                <p className="text-sm text-neutral-700">
                  {isAdmin
                    ? `מנהל ← ${userInfo?.name || "Admin"}`
                    : `מחובר כ—${userInfo?.name}`}
                </p>
                {isPremium && (
                  <div className="mt-1">
                    <p className="text-sm font-medium text-amber-600">Miel+ Active</p>
                    <p className="text-xs text-neutral-500">Premium פעיל</p>
                  </div>
                )}
              </div>
            </DropdownItem>
          </DropdownSection>

          {isAdmin ? (
            <>
              <DropdownItem key="admin-dashboard" as={Link} href="/admin">
                לוח בקרה
              </DropdownItem>

              <DropdownItem
                key="admin-moderation"
                as={Link}
                href="/admin/moderation"
              >
                אישור תמונות
              </DropdownItem>
            </>
          ) : (
            <>
              <DropdownItem
                key="ai-assistant"
                startContent={
                  <Icon name="comment" className="size-[18px] bg-orange-500" />
                }
                onPress={() => setIsAIModalOpen(true)}
                className="text-orange-600"
              >
                <span className="font-semibold">🧠 עוזר AI</span>
              </DropdownItem>

              {profileCompletion && profileCompletion.completionPercentage < 100 && (
                <DropdownItem
                  key="profile-completion"
                  as={Link}
                  href={recommended?.actionHref || "/members/edit"}
                  className="sm:hidden bg-gradient-to-r from-orange-50 to-red-50"
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-semibold text-orange-600">שפר פרופיל</span>
                    <span className="text-xs font-bold bg-orange-500 text-white px-2 py-0.5 rounded-full">
                      {profileCompletion.completionPercentage}%
                    </span>
                  </div>
                </DropdownItem>
              )}

              <DropdownItem key="profile" as={Link} href={`/members/${userId}`}>
                הפרופיל שלי
              </DropdownItem>

              <DropdownItem key="edit-profile" as={Link} href="/members/edit">
                ערוך פרופיל
              </DropdownItem>

              <DropdownItem key="premium-page" as={Link} href="/premium">
                שדרג לפרימיום
              </DropdownItem>
            </>
          )}

          <DropdownItem
            key="sign-out"
            color="danger"
            onPress={async () => {
              useConversationStore.getState().resetStore();
              useNotificationStore.getState().resetStore();
              await signOutUser();
            }}
          >
            התנתק
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>

      {/* AI Chat Modal */}
      {isAIModalOpen && (
        <AIChatModal
          userId={userId}
          isPremium={isPremium}
          onClose={() => setIsAIModalOpen(false)}
        />
      )}
    </>
  );
}
