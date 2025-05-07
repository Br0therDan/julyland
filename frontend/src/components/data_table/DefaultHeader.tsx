import { HeaderContext } from "@tanstack/react-table";
import React from "react";
import { FaSortAlphaDown, FaSortAlphaUp } from "react-icons/fa";
import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { ContextMenuContent } from "@radix-ui/react-context-menu";

interface DefaultHeaderProps<T> {
  info: HeaderContext<T, unknown>;
  name: string;
}

export default function DefaultHeader<T>({
  info,
  name,
}: DefaultHeaderProps<T>) {
  const sorted = info.column.getIsSorted();
  const table = info.table;
  return (
    <ContextMenu>
      <ContextMenuTrigger
        onPointerDown={(e) => {
          e.preventDefault();
          info.column.toggleSorting(info.column.getIsSorted() === "asc");
        }}
        className="flex w-full h-full font-bold items-center justify-start gap-2"
      >
        {name}
        {sorted === "asc" && <FaSortAlphaDown />}
        {sorted === "desc" && <FaSortAlphaUp />}
      </ContextMenuTrigger>
      <ContextMenuContent className="border min-w-[160px] rounded-md shadow-md bg-background p-2">
        {table
          .getAllColumns()
          .filter((column) => column.getCanHide())
          .map((column) => (
            <ContextMenuCheckboxItem
              key={column.id}
              className="capitalize"
              checked={column.getIsVisible()}
              onCheckedChange={(value) => column.toggleVisibility(!!value)}
            >
              {column.id}
            </ContextMenuCheckboxItem>
          ))}
      </ContextMenuContent>
    </ContextMenu>
  );
}
