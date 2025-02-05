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
  userInfo: { name: string | null; image: string | null } | null;
};

export default function UserMenu({ userInfo }: UserMenuProps) {
  return (
    <Dropdown placement="bottom-end">
      <DropdownTrigger>
        <Avatar
          as="button"
          className="transition-transform border-2 border-white rounded-full outline outline-2 outline-black bg-black"
          name={userInfo?.name || "user avatar"}
          size="sm"
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
            מחובר כ—{userInfo?.name}
          </DropdownItem>
        </DropdownSection>
        <DropdownItem key="edit-profile" as={Link} href="/members/edit">
          ערוך פרופיל
        </DropdownItem>
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
