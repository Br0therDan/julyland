import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { VariantService } from "@/lib/api";
import { formatDateTime } from "@/utils/formatDate";
import { toast } from "sonner";
import { VariantPublic } from "@/client/management";

import { Badge } from "@/components/ui/badge";
import InventoryForm from "../inventory/InventoryForm";
import DefaultHeader from "@/components/data_table/DefaultHeader";
import ActionsMenu from "@/components/common/ActionsMenu";
import { handleApiError } from "@/lib/errorHandler";
import VariantForm from './VariantForm';

export const columns: ColumnDef<VariantPublic>[] = [
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
    accessorKey: "category",
    id: "카테고리",
    header: (info) => {
      return <DefaultHeader<VariantPublic> info={info} name="카테고리" />;
    },
    cell: ({ row }) => {
      const productVariant = row.original;
      return (
        <span className="text-sm capitalize">
          {productVariant.product?.brand.category.name}
        </span>
      );
    },
  },
  {
    accessorKey: "brand",
    id: "브랜드",
    header: (info) => {
      return <DefaultHeader<VariantPublic> info={info} name="브랜드" />;
    },
    cell: ({ row }) => {
      const productVariant = row.original;
      return (
        <span className="text-sm capitalize">
          {productVariant.product?.brand.name}
        </span>
      );
    },
  },
  {
    accessorKey: "name",
    id: "제품명",
    header: (info) => {
      return <DefaultHeader<VariantPublic> info={info} name="제품명" />;
    },
    cell: ({ row }) => {
      const productVariant = row.original;
      return (
        <span className="text-sm capitalize">
          {productVariant.product?.name}
        </span>
      );
    },
  },
  {
    accessorKey: "name",
    id: "변형 이름",
    header: (info) => {
      return <DefaultHeader<VariantPublic> info={info} name="변형" />;
    },
  },
  {
    accessorKey: "sku",
    id: "SKU",
    header: (info) => {
      return <DefaultHeader<VariantPublic> info={info} name="SKU" />;
    },
  },
  {
    accessorKey: "options",
    id: "옵션",
    header: (info) => {
      return <DefaultHeader<VariantPublic> info={info} name="옵션" />;
    },
    cell: ({ row }) => {
      const productVarient = row.original;
      return (
        <div className="flex items-center gap-2">
          {productVarient.options?.map((option) => (
            <Badge key={option.name} className="text-sm">
              {option.name} : {String(option.value)} {String(option.unit)}
            </Badge>
          ))}
        </div>
      );
    },
  },
  {
    accessorKey: "price",
    id: "가격",
    header: (info) => {
      return <DefaultHeader<VariantPublic> info={info} name="가격" />;
    },
    cell: ({ row }) => {
      const productVariant = row.original;
      return (
        <div className="flex items-center gap-2">
          {productVariant.price.toLocaleString("ko-KR")} 원
        </div>
      );
    },
  },

  {
    accessorKey: "updated_at",
    id: "최종 수정일",
    header: (info) => {
      return <DefaultHeader<VariantPublic> info={info} name="최종 수정일" />;
    },
    cell: ({ row }) => {
      const product = row.original;
      return (
        <div className="flex items-center gap-2">
          {formatDateTime(product.updated_at)}
        </div>
      );
    },
  },
  {
    id: "실행",
    cell: ({ row }) => {
      const productVariant = row.original;
      return (
        <ActionsMenu
          title=""
          editButton={
            <VariantForm
              mode="edit"
              product_id={productVariant.product?._id}
              variant={productVariant}
            />
          }
          addButton={<InventoryForm mode="add" variant={productVariant} />}
          value={productVariant}
          deleteApi={async () => {
            try {
              await VariantService.variantDeleteVariant(productVariant._id);
              toast.success(
                `"${productVariant.name}" 제품변형이 삭제되었습니다.`
              );
            } catch (err) {
              handleApiError(err, (message) =>
                toast.error(message.title, { description: message.description })
              );
            }
          }}
        />
      );
    },
  },
];
