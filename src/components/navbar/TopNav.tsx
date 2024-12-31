import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  Link,
  Button,
} from "@nextui-org/react";

import { RiHeartPulseLine } from "react-icons/ri";
import NavLink from "./NavLink";
import { auth } from "@/auth";
import UserMenu from "./UserMenu";
import { getUserInfoForNav } from "@/app/actions/userActions";

export default async function TopNav() {
  const session = await auth();
  const userInfo = session?.user && (await getUserInfoForNav());

  return (
    <Navbar
      maxWidth="xl"
      className="bg-gradient-to-r from-purple-400 to-purple-700"
      classNames={{
        item: [
          "text-xl",
          "text-white",
          "uppercase",
          "data-[active=true]:text-yellow-200",
        ],
        brand: "",
        content: "",
      }}
    >
      <NavbarBrand as={Link} href="/">
        <RiHeartPulseLine
          size={35}
          className="text-white animate-pulse-once hover:text-red-400"
        />

        <div className="m-2 font-bold text-3xl flex">
          <span className=" text-gray-900">הקליל</span>
          <span className=" text-gray-200">הבא</span>
        </div>
      </NavbarBrand>

      <NavbarContent className="hidden sm:flex gap-4" justify="center">
        <NavLink href="/members" label="התאמות" />
        <NavLink href="/messages" label="הודעות" />
        <NavLink href="/lists" label="רשימות" />
      </NavbarContent>

      <NavbarContent justify="end">
        {userInfo ? (
          <UserMenu userInfo={userInfo} />
        ) : (
          <>
            <Button
              as={Link}
              href="/login"
              variant="bordered"
              className="text-white"
            >
              כניסה
            </Button>
            <Button
              as={Link}
              href="/register"
              variant="bordered"
              className="text-white"
            >
              הרשמה
            </Button>
          </>
        )}
      </NavbarContent>
    </Navbar>
  );
}
