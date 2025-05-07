'use client'
import React from 'react'
import DataTable from '@/components/data_table/DataTable'
import { columns } from './columns'
import { useRanking } from '@/hooks/useRanking'


export default function RankingDetailTable() {
  const { currentRankingSnapshot } = useRanking();
  const items = currentRankingSnapshot?.items || [];

  return (
      <DataTable columns={columns} data={items} />
  )
}
