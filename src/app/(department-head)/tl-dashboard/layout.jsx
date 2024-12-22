import TLSidebar from '@/components/Tl/TlSidebar'
import { SidebarProvider } from '@/components/ui/sidebar'
import React from 'react'

const layout = ({children}) => {
  return (
    <SidebarProvider>
        <div>
        <TLSidebar />
        </div>
        <div className='w-full '>
        {children}
        </div>
    </SidebarProvider>
  )
}

export default layout