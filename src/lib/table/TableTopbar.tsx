import React from 'react'
import { twMerge } from 'tailwind-merge'

export default function TableTopbar({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={twMerge('flex p-4 bg-white border border-b-0 rounded-t-md', className)}>
      {children}
    </div>
  )
}
