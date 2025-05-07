// src/components/dashboard/admin-sidebar.tsx
'use client'
import React from 'react'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,

} from '@/components/ui/sidebar'

import {
  Home,
  AppWindowIcon,
  ChartColumnBig,
  Box,
  Store,
  Warehouse,
  PackageOpen,
  ShoppingCart,
  Package,

} from 'lucide-react'
import Link from 'next/link'



const items = [
  {
    title: '대시보드',
    url: '/dashboard',
    icon: Home,
  },
  {
    title: '랭킹',
    url: '/dashboard/rankings',
    icon: ChartColumnBig,
  },
  {
    title: '제품관리',
    url: '/dashboard/products',
    icon: Package,
  },
  {
    title: '인벤토리',
    url: '/dashboard/inventory',
    icon: Warehouse,
  },
  {
    title: '리스팅',
    url: '/dashboard/listings',
    icon: ShoppingCart,
  },
  {
    title: '도구',
    url: '/dashboard/tools',
    icon: AppWindowIcon,
  },
]

export default function DashboardSidebar() {
  return (
    <Sidebar>
      <SidebarHeader>

      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          {/* <SidebarGroupLabel>Admin</SidebarGroupLabel> */}
          <SidebarGroupContent>
            <SidebarMenu className='space-y-4 p-2'>

              {items.map((item) => {
                // 기본 URL 구조에서 /admin 부분은 제거하고, 선택된 app.path를 앞에 붙입니다.
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      className='flex ml-2 items-center space-x-2'
                    >
                      <Link href={item.url}>
                        <item.icon className='text-lg' />
                        <span className='text-lg'>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
