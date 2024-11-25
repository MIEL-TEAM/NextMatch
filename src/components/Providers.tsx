'use client'

import { NextUIProvider } from "@nextui-org/react";
import React, { type ReactNode } from "react";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';


type ProvidersProps = {
  children: ReactNode;
};

export default function Providers({ children }: ProvidersProps) {
  return (
    <NextUIProvider>
      <ToastContainer position='bottom-right' hideProgressBar className='z-50' />
      {children}
    </NextUIProvider>
  );
}
