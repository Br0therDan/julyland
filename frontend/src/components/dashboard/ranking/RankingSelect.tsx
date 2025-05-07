"use client";
import React from "react";
import { useRanking } from "@/hooks/useRanking";
import { formatDateTime } from "@/utils/formatDate";
import ActionsMenu from "@/components/common/ActionsMenu";
import { RankingService } from "@/lib/api";
import { Download } from "lucide-react";
import { MyButton } from "@/components/common/buttons/submit-button";
import { Select } from "@radix-ui/react-select";
import {
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCategory } from "@/hooks/useCategory";

export default function RankingSelect() {
  const {
    rankings,
    rankingId,
    loading,
    scrapeRanking,
    currentRankingSnapshot,
    setRankingId,
  } = useRanking();

  const { currentCategoryName } = useCategory();
  return (
    <Select>
      <SelectTrigger className=" capitalize">
        <SelectValue
          placeholder={`스냅샷 선택 : ${formatDateTime(
            currentRankingSnapshot?.timestamp
          )}`}
        />
      </SelectTrigger>
      <SelectContent className="w-full p-1">
        {rankings.map((r) => {
          return (
            <SelectItem
              key={r._id}
              value={r._id}
              className={`text-sm flex justify-between ${
                r._id == rankingId ? "font-bold bg-blue-100" : ""
              }`}
              onClick={() => {
                if (r._id == rankingId) {
                  return;
                }
                setRankingId(r._id);
              }}
            >
              <span>{formatDateTime(r.timestamp)}</span>
              <ActionsMenu
                title="랭킹"
                value={r}
                deleteApi={async () => {
                  await RankingService.rankingDeleteRanking(r._id);
                }}
              />
            </SelectItem>
          );
        })}

        <MyButton
          variant="default"
          isLoading={loading}
          className="w-full justify-center text-sm"
          onClick={() => scrapeRanking(currentCategoryName)}
        >
          <Download className="mr-2 h-4 w-4" />
          랭킹 업데이트
        </MyButton>
      </SelectContent>
    </Select>
  );
}
