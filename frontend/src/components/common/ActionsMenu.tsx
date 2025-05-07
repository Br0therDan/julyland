import React, { useState } from "react";
import { MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import DeleteAlert from "@/components/common/DeleteAlert";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
interface ActionsMenuProps<T extends { _id: string; name?: string }> {
  title: string;
  addButton?: React.ReactNode;
  editButton?: React.ReactNode;
  value: T;
  deleteApi: () => Promise<void>;
}

export default function ActionsMenu<T extends { _id: string; name?: string }>({
  title,
  editButton,
  addButton,
  value,
  deleteApi,
}: ActionsMenuProps<T>) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost">
          <MoreVertical />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent onCloseAutoFocus={(e) => e.preventDefault()}>
        {editButton && (
          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault();
            }}
          >
            {editButton}
          </DropdownMenuItem>
        )}
        {addButton && (
          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault();
            }}
          >
            {addButton}
          </DropdownMenuItem>
        )}
        <DropdownMenuItem
          onSelect={(e) => {
            e.preventDefault();
          }}
        >
          <DeleteAlert
            id={value._id}
            title={title}
            description={`"${value.name}"을 삭제하시겠습니까?`}
            deleteApi={deleteApi}
            onClose={() => {}}
          />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
