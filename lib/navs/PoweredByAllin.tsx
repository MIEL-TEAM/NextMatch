import { baseUrl } from '@/types/vars'

export default function PoweredByAllin() {
  return (
    <div className='text-center py-2 bg-gray-100 w-full'>
      <a href={`${baseUrl}`} className='inline-flex  items-center'>
        <span className='ml-2 text-sm font-semibold'>מופעל ע"י</span>
        <img src='/media/logo.svg' alt='Allin Logo' className='h-4' />
      </a>
    </div>
  )
}
