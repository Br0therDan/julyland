"use client";
import React from "react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ProductService } from "@/lib/api";
import { handleApiError } from "@/lib/errorHandler";
import { ProductPublic } from "@/client/management";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProductForm from "./ProductForm";
import DashboardCard from "@/components/common/card/DashboardCard";
import { Badge } from "@/components/ui/badge";
import ProductVariantForm from '../variant/ProductVariantForm';
import ActionsMenu from '@/components/common/ActionsMenu';

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

  const handleDeleteClick = async (product: ProductPublic) => {
    try {
      await ProductService.productDeleteProduct(product._id!);
      fetchProducts();
      toast.success("제품 삭제 성공", {
        description: `${product.name} 제품이 삭제되었습니다.`,
      });
    } catch (err) {
      handleApiError(err, (message) =>
        toast.error(message.title, { description: message.description })
      );
    }
  };

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
                <Badge variant="outline" className='h-7 font-bold capitalize'>{product.brand.category.name}</Badge>
                <Badge variant="secondary" className='h-7 font-bold'>{product.brand.name}</Badge>
                <div className="">{product.name}</div>
              </div>
              {/* <div className="space-x-1 mr-2">
                <ProductForm
                  mode="edit"
                  product={product}
                  onSuccess={fetchProducts}
                />
                <ProductVariantForm mode="add" product_id={product._id} />
                <Button
                  variant={"ghost"}
                  onClick={() => handleDeleteClick(product)}
                  className="text-sm text-red-500 hover:underline"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div> */}
        <ActionsMenu
          title = "제품"
          editButton={
            <ProductForm 
              mode="edit" 
              product={product} 
            />}
          addButton={
            <ProductVariantForm 
              mode="add" 
              product_id={product._id} 
            />}
          value={product}
          deleteApi={async () => {
            try {
              await ProductService.productDeleteProduct(product._id);
              toast.success(`"${product.name}" 제품이 삭제되었습니다.`);
            }
            catch (err) {
              toast.error(`"${product.name}" 제품 삭제에 실패하였습니다.`);
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
