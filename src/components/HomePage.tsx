"use client";

import { motion } from "framer-motion";
import Image from "next/image";
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
      className="flex flex-col justify-center items-center min-h-screen overflow-hidden text-black fixed inset-0 px-6 sm:px-12"
    >
      <motion.div
        initial={{ y: -10 }}
        animate={{ y: [0, -10, 0] }}
        transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
        className="flex flex-col items-center text-center"
      >
        <Image
          src="/images/icons/Logo.png"
          width={80}
          height={80}
          alt="Miel Logo"
          className="object-contain w-16 h-16 sm:w-20 sm:h-20"
        />

        <motion.h1
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="text-4xl sm:text-6xl md:text-7xl font-bold mt-6 bg-gradient-to-r from-[#F6D365] via-[#FFB547] to-[#E37B27] bg-clip-text text-transparent"
        >
          ברוכים הבאים ל - Miel
        </motion.h1>
      </motion.div>

      {session !== "guest" ? (
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="bg-gradient-to-r from-[#F6D365] via-[#FFB547] to-[#E37B27] text-white px-6 py-3 rounded-lg mt-8 shadow-lg text-lg sm:text-xl"
        >
          <Link href="/members">המשך</Link>
        </motion.button>
      ) : (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
          className="flex flex-col sm:flex-row gap-4 sm:gap-6 mt-8 w-full max-w-md"
        >
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="bg-gradient-to-r from-[#F6D365] via-[#FFB547] to-[#E37B27] text-white px-6 py-3 rounded-lg shadow-lg text-lg sm:text-xl w-full"
          >
            <Link href="/login">התחברות</Link>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="bg-gradient-to-r from-[#F6D365] via-[#FFB547] to-[#E37B27] text-white px-6 py-3 rounded-lg shadow-lg text-lg sm:text-xl w-full"
          >
            <Link href="/register">הרשמה</Link>
          </motion.button>
        </motion.div>
      )}
    </motion.div>
  );
}
