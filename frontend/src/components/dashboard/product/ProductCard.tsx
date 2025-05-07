"use client";
import React from "react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ProductService } from "@/lib/api";
import { handleApiError } from "@/lib/errorHandler";
import { ProductPublic } from "@/client/management";
import ProductForm from "./ProductForm";
import DashboardCard from "@/components/common/card/DashboardCard";
import { Badge } from "@/components/ui/badge";

import ActionsMenu from "@/components/common/ActionsMenu";
import VariantForm from '../variant/VariantForm';

/**
 * 제품 목록과 서브제품를 트리 형태로 보여주는 컴포넌트
 */

export default function ProductCard() {
  const [products, setProducts] = useState<ProductPublic[]>([]);
  const fetchProducts = async () => {
    try {
      const response = await ProductService.productListProducts();
      const products = response.data;
      if (!products) {
        return;
      }
      setProducts(products);
    } catch (err) {
      handleApiError(err, (message) =>
        toast.error(message.title, { description: message.description })
      );
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);


  return (
    <DashboardCard
      title="제품"
      className="w-full"
      footer={<ProductForm mode="add" onSuccess={fetchProducts} />}
    >
      <ul className="space-y-3 overflow-y-auto">
        {products.map((product) => (
          <li key={product._id} className="border-b pb-1 last:border-none">
            {/* 제품 항목 */}
            <div className="flex items-center justify-between  px-2">
              <div className="flex flex-1 items-center space-x-4">
                <Badge variant="outline" className="h-7 font-bold capitalize">
                  {product.brand.category.name}
                </Badge>
                <Badge variant="secondary" className="h-7 font-bold">
                  {product.brand.name}
                </Badge>
                <div className="">{product.name}</div>
              </div>
              <ActionsMenu
                title="제품"
                editButton={<ProductForm mode="edit" product={product} />}
                addButton={<VariantForm mode="add" product_id={product._id} />}
                value={product}
                deleteApi={async () => {
                  try {
                    await ProductService.productDeleteProduct(product._id);
                    toast.success(`"${product.name}" 제품이 삭제되었습니다.`);
                  } catch (err) {
                    handleApiError(err, (message) =>
                      toast.error(message.title, {
                        description: message.description,
                      })
                    );
                  }
                }}
              />
            </div>
          </li>
        ))}
      </ul>
    </DashboardCard>
  );
}
