"use client";

import { motion } from "framer-motion";
import { Image } from "@nextui-org/react";
import Link from "next/link";

export type MielHomePageProps = {
  session: string;
};

export default function MielHomePage({ session }: MielHomePageProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className="flex flex-col justify-center items-center h-screen overflow-hidden text-black fixed inset-0"
    >
      <motion.div
        initial={{ y: -10 }}
        animate={{ y: [0, -10, 0] }}
        transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
        className="flex flex-col items-center"
      >
        <Image
          src="/icons/Logo.png"
          width={80}
          height={80}
          alt="Miel Logo"
          className="object-contain"
        />

        <motion.h1
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="text-7xl font-bold mt-6 bg-gradient-to-r from-[#F6D365] via-[#FFB547] to-[#E37B27] bg-clip-text text-transparent"
        >
          ברוכים הבאים ל - Miel
        </motion.h1>
      </motion.div>

      {session !== "guest" ? (
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="bg-gradient-to-r from-[#F6D365] via-[#FFB547] to-[#E37B27] text-white px-6 py-3 rounded-lg mt-8 shadow-lg"
        >
          <Link href="/members">המשך</Link>
        </motion.button>
      ) : (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
          className="flex flex-row gap-6 mt-8"
        >
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="bg-gradient-to-r from-[#F6D365] via-[#FFB547] to-[#E37B27] text-white px-6 py-3 rounded-lg shadow-lg"
          >
            <Link href="/login">התחברות</Link>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="bg-gradient-to-r from-[#F6D365] via-[#FFB547] to-[#E37B27] text-white px-6 py-3 rounded-lg shadow-lg"
          >
            <Link href="/register">הרשמה</Link>
          </motion.button>
        </motion.div>
      )}
    </motion.div>
  );
}
