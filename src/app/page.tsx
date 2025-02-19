import { auth } from "@/auth";
import { Button, Image } from "@nextui-org/react";
import Link from "next/link";

export default async function Home() {
  const session = await auth();

  return (
    <div className="flex flex-col justify-center items-center mt-20 gap-6 text-secondary">
      <Image
        src="/icons/Logo.png"
        width={35}
        height={35}
        alt="logo png"
        className="object-contain animate-bounce-slow transition-transform duration-[2000ms] ease-in-out hover:scale-105"
      />
      <h1 className="text-4xl font-bold">ברוכים הבאים ל - Miel</h1>
      {session ? (
        <Button
          as={Link}
          href="/members"
          size="lg"
          color="secondary"
          variant="bordered"
        >
          המשך
        </Button>
      ) : (
        <>
          <div className="flex flex-row gap-4">
            <Button
              as={Link}
              href="/login"
              size="lg"
              color="secondary"
              variant="bordered"
            >
              התחברות
            </Button>
            <Button
              as={Link}
              href="/register"
              size="lg"
              color="secondary"
              variant="bordered"
            >
              הרשמה
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
