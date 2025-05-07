import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { ProductService } from "@/lib/api";
import { formatDateTime } from "@/utils/formatDate";
import { toast } from "sonner";
import { ProductPublic } from "@/client/management";
import ProductForm from "./ProductForm";
import DefaultHeader from "@/components/data_table/DefaultHeader";
import ActionsMenu from "@/components/common/ActionsMenu";

import { Badge } from "@/components/ui/badge";
import VariantForm from '../variant/VariantForm';
import { handleApiError } from '@/lib/errorHandler';

export const columns: ColumnDef<ProductPublic>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),

    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "media_urls",
    id: "이미지",
    header: (info) => {
      return <DefaultHeader<ProductPublic> info={info} name="" />;
    },
    cell: ({ row }) => {
      return (
        <img
          src={row.original.media_urls?.[0] || "/placeholder.jpg"}
          alt={row.original.name}
          width={60}
          height={60}
          className="rounded-xs"
          style={{ width: 60, height: 60, objectFit: "cover" }}
        />
      );
    },
    enableResizing: true,
    enableHiding: false,
  },
  {
    accessorKey: "category",
    id: "카테고리",
    header: (info) => {
      return <DefaultHeader<ProductPublic> info={info} name="카테고리" />;
    },
    cell: ({ row }) => {
      const product = row.original;
      return (
        <span className="text-sm capitalize">
          {product.brand.category.name}
        </span>
      );
    },
    enableResizing: true,
  },
  {
    accessorKey: "brand",
    id: "브랜드",
    header: (info) => {
      return <DefaultHeader<ProductPublic> info={info} name="브랜드" />;
    },
    cell: ({ row }) => {
      const product = row.original;
      return <span className="text-sm capitalize">{product.brand?.name}</span>;
    },
  },
  {
    accessorKey: "name",
    id: "제품명",
    header: (info) => {
      return <DefaultHeader<ProductPublic> info={info} name="제품명" />;
    },
    cell: ({ row }) => {
      const product = row.original;
      return <span className="text-sm capitalize">{product.name}</span>;
    },
  },
  {
    accessorKey: "locale_names",
    id: "제품명(다국어)",
    header: (info) => {
      return <DefaultHeader<ProductPublic> info={info} name="제품명(다국어)" />;
    },
    cell: ({ row }) => {
      const product = row.original;
      return (
        <div className="flex flex-col gap-1">
          {product.locale_names.map((locale) => (
            <div key={locale.locale} className="text-sm capitalize">
              <Badge variant="outline" className="mr-2 bg-blue-100">
                {locale.locale === "ko" && "한국어"}
                {locale.locale === "ja" && "일본어"}
                {locale.locale === "zh" && "중국어"}
              </Badge>
              {locale.name}
            </div>
          ))}
        </div>
      );
    },
  },
  {
    accessorKey: "created_at",
    id: "등록일",
    header: (info) => {
      return <DefaultHeader<ProductPublic> info={info} name="등록일" />;
    },
    cell: ({ row }) => {
      const product = row.original;
      return (
        <span className="text-sm">{formatDateTime(product.created_at)}</span>
      );
    },
  },
  {
    accessorKey: "updated_at",
    id: "수정일",
    header: (info) => {
      return <DefaultHeader<ProductPublic> info={info} name="수정일" />;
    },
    cell: ({ row }) => {
      const product = row.original;
      return (
        <span className="text-sm">{formatDateTime(product.updated_at)}</span>
      );
    },
  },
  {
    id: "실행",
    header: (info) => {
      return <DefaultHeader<ProductPublic> info={info} name="" />;
    },
    cell: ({ row }) => {
      const product = row.original;
      return (
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
      );
    },
    enableHiding: false,
    enableSorting: false,
    size: 100,
  },
];
