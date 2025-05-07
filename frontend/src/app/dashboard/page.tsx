

import PageTitle from "@/components/common/PageTitle";
import BrandCard from '@/components/dashboard/brand/BrandCard';
import CategoryCard from '@/components/dashboard/category/CategoryCard';
import MarketCard from '@/components/dashboard/market/MarketCard';
import ProductCard from '@/components/dashboard/product/ProductCard';
import ProductsTable from '@/components/dashboard/product/ProductsTable';

import React from "react";

export default function DashbardPage() {
  return (
    <div className='flex flex-col h-full p-4 sm:p-8'>
      <PageTitle title="대시보드" description="관리자 대시보드" />
      <div className='flex py-4 sm:py-6 gap-3'>
        <CategoryCard />
        <BrandCard />
        <MarketCard />
      </div>
        <ProductsTable />
    </div>
  );
}
