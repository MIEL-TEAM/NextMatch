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
import React from "react";

type UserMenuProps = {
  userInfo: {
    name: string | null;
    image: string | null;
  } | null;
  userId?: string | undefined;
  isAdmin?: boolean;
};

export default function UserMenu({
  userInfo,
  userId,
  isAdmin = false,
}: UserMenuProps) {
  if (!userId) {
    return null;
  }

  return (
    <Dropdown placement="bottom-end">
      <DropdownTrigger>
        <Avatar
          as="button"
          className="transition-transform border-2 border-white rounded-full outline outline-2 outline-black bg-black"
          name={userInfo?.name || "user avatar"}
          size="md"
          src={userInfo?.image || "/images/user.png"}
        />
      </DropdownTrigger>

      <DropdownMenu variant="flat" aria-label="User actions menu">
        <DropdownSection showDivider>
          <DropdownItem
            key="username-display"
            aria-label="username"
            isReadOnly
            as="span"
            className="h-14 flex flex-row"
          >
            {isAdmin
              ? `מנהל ← ${userInfo?.name || "Admin"}`
              : `מחובר כ—${userInfo?.name}`}
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
          onPress={async () => signOutUser()}
        >
          התנתק
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
}
