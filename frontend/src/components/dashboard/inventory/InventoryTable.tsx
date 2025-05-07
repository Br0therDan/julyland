'use client'
import React from 'react'
import { useEffect, useState } from 'react'

import { InventoryService } from '@/lib/api'
import type { InventoryPublic } from '@/client/management'
import DataTable from '@/components/data_table/DataTable'
import Loading from '@/components/common/Loading'
import { handleApiError } from '@/lib/errorHandler'
import { toast } from 'sonner'
import { columns } from './columns'

export default function InventoryTable() {
  const [inventories, setInventories] = useState<InventoryPublic[]>([])
  const [loading, setLoading] = useState<boolean>(true)


  const fetchInventorys = async () => {
    setLoading(true)
    try {
      const response = await InventoryService.inventoryListInventory()
      setInventories(response.data)
    } catch (err) {
      handleApiError(err, (message) =>
        toast.error(message.title, { description: message.description })
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInventorys()
  }, [])

  if (loading) {
    return <Loading />
  }

  return (
    <div className='space-y-2'>
      <DataTable columns={columns} data={inventories} />
    </div>
  )
}
