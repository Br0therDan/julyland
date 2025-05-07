"use client";
import React, { use, useEffect } from "react";
import { toast } from "sonner";
import { handleApiError } from "@/lib/errorHandler";
import { Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import BrandForm from "./BrandForm";
import { BrandPublic } from "@/client/management";
import { BrandService } from "@/lib/api";
import DashboardCard from "@/components/common/card/DashboardCard";
import { Badge } from "@/components/ui/badge";
import { useCategory } from '@/hooks/useCategory';
import ActionsMenu from '@/components/common/ActionsMenu';

export default function BrandCard() {
  const { brands, fetchBrands } = useCategory();

  useEffect(() => {
    fetchBrands("total");
  }, []);

  const handleDeleteClick = async (brand: BrandPublic) => {
    try {
      await BrandService.brandDeleteBrand(brand._id);
      fetchBrands("total");
      toast.success("브랜드 삭제", {
        description: `${brand.name} 브랜드 삭제 완료`,
      });
    } catch (err) {
      handleApiError(err, (message) =>
        toast.error(message.title, { description: message.description })
      );
    }
  };

  return (
    <DashboardCard
      title="브랜드"
      footer={<BrandForm mode="add" onSuccess={() => fetchBrands("total")} />}
    >
      <ul className="space-y-3 text-sm overflow-y-auto">
        {brands.map((brand) => (
          <li key={brand._id} className="border-b pb-1 last:border-none">
            {/* 브랜드 항목 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className='h-6 w-15 capitalize'>
                  {brand.category?.name}
                </Badge>
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-200">
                  {brand.logo_url ? (
                    <img
                      src={brand.logo_url}
                      alt={brand.name}
                      className="object-cover w-full h-full rounded-full"
                    />
                  ) : (
                    <span className="text-gray-500"></span>
                  )}
                </div>
                <div className="">{brand.name}</div>
              </div>
              <div className="">
                <ActionsMenu 
                  title="브랜드"
                  value={brand}
                  editButton={
                    <BrandForm mode="edit" brand={brand} onSuccess={() => fetchBrands("total")} />
                  }
                  deleteApi={async () => {
                    await BrandService.brandDeleteBrand(brand._id);
                    fetchBrands("total");
                    toast.success("브랜드 삭제", {
                      description: `${brand.name} 브랜드 삭제 완료`,
                    });
                  }}
                  />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </DashboardCard>
  );
}
