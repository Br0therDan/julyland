'use client'
import React from 'react'
import DataTable from '@/components/data_table/DataTable'
import { columns } from './columns'
import { useProduct } from '@/hooks/useProduct'

export default function ProductsTable() {

  const { products } = useProduct()

  return (
    <div className='space-y-2'>
      <DataTable
        columns={columns}
        data={products}
      />
    </div>
  )
}
