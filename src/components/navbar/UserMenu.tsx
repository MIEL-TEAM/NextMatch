'use client'

import { signOutUser } from "@/app/actions/authActions";
import {Avatar, Dropdown, DropdownItem, DropdownMenu, DropdownSection, DropdownTrigger} from "@nextui-org/react";
import { Session } from "next-auth";
import Link from "next/link";
import React from "react";

type UserMenuProps = {
  user: Session["user"];
};

export default function UserMenu({ user }: UserMenuProps) {
  return (
    <Dropdown placement="bottom-end">
      <DropdownTrigger>
        <Avatar
          isBordered
          as="button"
          className="transition-transform"
          color="secondary"
          name={user?.name || "user avatar"}
          size="sm"
          src={user?.image || "/images/user.png"}
        />
      </DropdownTrigger>

      <DropdownMenu variant="flat" aria-label="User actions menu">
        <DropdownSection showDivider>
          <DropdownItem aria-label="username" isReadOnly as="span" className="h-14 flex flex-row">
              Signed in as {user?.name}
          </DropdownItem>
        </DropdownSection>
        <DropdownItem as={Link} href="/members/edit">
           Edit profile
        </DropdownItem>
        <DropdownItem color="danger" onClick={async () => signOutUser()}>
           Log Out
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
}
