import React from 'react'
import { Search } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
export function SearchForm({ ...props }: React.ComponentProps<'form'>) {
  return (
    <div className='flex-1 flex items-center justify-end px-2 lg:ml-6'>
      <form {...props}>
        <div className='py-0'>
          <div className='relative'>
            <Label htmlFor='search' className='sr-only'>
              Search
            </Label>
            <Input id='search' placeholder='Search..' className='pl-8' />
            <Search className='pointer-events-none absolute left-2 top-1/2 size-4 -translate-y-1/2 select-none opacity-50' />
          </div>
        </div>
      </form>
    </div>
  )
}
// import { Search } from 'lucide-react'
// import { Input } from '@/components/ui/input'

// export default function SearchForm() {
//   return (
//     <div className="flex-1 flex items-center justify-end px-2 lg:ml-6">
//     <div className="max-w-lg w-full lg:max-w-xs">
//       <label htmlFor="search" className="sr-only">Search</label>
//       <div className="relative">
//         <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//           <Search className="h-5 w-5 text-gray-400" aria-hidden="true" />
//         </div>
//         <Input
//           id="search"
//           name="search"
//           className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
//           placeholder="Search"
//           type="search"
//         />
//       </div>
//     </div>
//   </div>
//   )
// }
