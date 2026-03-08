'use client'
import { MapRoles } from '@/types/roles'
import Link from 'next/link'
import { twMerge } from 'tailwind-merge'
import Icon from '@/lib/Icon'

export default function Topbar({ user, agency }) {
  if (!user) return null
  return (
    <div className='w-full'>
      <div className='flex justify-between items-center h-10 wrap bg-white/90 backdrop-blur-lg  top-0 left-0 z-[888] border-b'>
        <button className='hover:bg-gray-100 p-2 rounded desktop:hidden' popoverTarget='navPop'>
          <Icon name='bars' type='reg' />
        </button>
        <div className='hidden desktop:block'>
          <UserNAgency user={user} agency={agency} />
        </div>
        <Link href='/'>
          <img src='/media/logo.svg' alt='allin crm' className='h-5' />
        </Link>
      </div>
    </div>
  )
}

export function UserNAgency({ user, agency, className = null }) {
  return (
    <div className={twMerge('flex', className)}>
      <Link href='/settings/self_edit' className='flex gap-3' onClick={() => document.getElementById('navPop')?.hidePopover()}>
        {user?.picture ? (
          <img src={user?.picture} alt='' className='size-6 rounded-full' />
        ) : (
          <div className='bg-solid text-white size-6 text-center rounded-full'>{user?.name?.[0]}</div>
        )}
        <p className='text-sm'>{`${user?.name} - ${MapRoles[user?.role]}`}</p>
      </Link>
      /
      {agency.img ? (
        <img src={agency.img.url} alt='agency logo' className='h-4 lg:h-6' title={agency.name} />
      ) : (
        <p className='text-sm font-bold mr-2'>{agency.name}</p>
      )}
    </div>
  )
}
