
import React from "react";
import PageTitle from "@/components/common/PageTitle";
import InventoryTable from '@/components/dashboard/inventory/InventoryTable';

export default function InventoryPage() {
  return (
    <>
      <div className="flex flex-col h-full p-4 sm:p-8">
        <PageTitle title="인벤토리" description="인벤토리 관리 페이지 입니다." />
        <InventoryTable />
      </div>

    </>
  );
}
