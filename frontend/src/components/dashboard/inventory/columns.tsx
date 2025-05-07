import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { InventoryService } from "@/lib/api";
import { formatDateTime } from "@/utils/formatDate";

import DeleteAlert from "@/components/common/DeleteAlert";
import { toast } from "sonner";
import { InventoryPublic, VariantPublic } from "@/client/management";
import InventoryForm from "./InventoryForm";
import { Badge } from "@/components/ui/badge";

export const columns: ColumnDef<InventoryPublic>[] = [
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
    accessorKey: "variant",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          아이템
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ cell }) => {
      const variant = cell.getValue() as VariantPublic;
      return (
        <div className="flex items-center gap-2">
          <span className="font-bold">{variant.product.name}</span>
          <Badge className="text-sm">{variant.name}</Badge>
          <span className="text-sm">
            {variant.options?.map(
              (option) => `${option.name}: ${option.value}`
            )}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "change_type",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          유형
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const inventory = row.original;
      return (
        <div className="flex items-center gap-2">
          {inventory.change_type === "in" ? (
            <Badge variant="default">입고</Badge>
          ) : inventory.change_type === "out" ? (
            <Badge variant="destructive">출고</Badge>
          ) : (
            <Badge variant="outline">변경</Badge>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "quantity",
    header: "수량",
  },
  {
    accessorKey: "created_at",
    header: "최초 생성일",
    cell: ({ row }) => {
      const inventory = row.original;
      return (
        <div className="flex items-center gap-2">
          {formatDateTime(inventory.updated_at)}
        </div>
      );
    },
  },
  {
    accessorKey: "updated_at",
    header: "최종 수정일",
    cell: ({ row }) => {
      const inventory = row.original;
      return (
        <div className="flex items-center gap-2">
          {formatDateTime(inventory.updated_at)}
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const inventory = row.original;
      return (
        <div>
          <InventoryForm
            mode="edit"
            inventory={inventory}
            variant={inventory.variant}
            onSuccess={async () => {
              await InventoryService.inventoryListInventory();
              toast.success(
                `"${inventory.variant.product.name} ${inventory.variant.name}" 인벤토리가 수정되었습니다.`
              );
            }}
          />
          <DeleteAlert
            id={inventory._id}
            title="인벤토리 삭제"
            description={`"${inventory.variant.product.name} ${inventory.variant.name}" 인벤토리를 삭제하시겠습니까?`}
            deleteApi={async () => {
              await InventoryService.inventoryDeleteInventory(inventory._id);
              window.location.reload();
            }}
            onClose={() => {}}
          />
        </div>
      );
    },
  },
];
