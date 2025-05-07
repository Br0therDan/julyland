"use client";
import React from "react";
import PageTitle from "@/components/common/PageTitle";
import RankingSelect from "@/components/dashboard/ranking/RankingSelect";
import RankingDetailTable from "@/components/dashboard/ranking/RankingDetailTable";
import { Rss } from "lucide-react";
import { MyButton } from "@/components/common/buttons/submit-button";
import { useCategory } from '@/hooks/useCategory';
import { useRanking } from "@/hooks/useRanking";
import CategorySwitcher from "@/components/dashboard/category/CategorySwitcher";

export default function RankingPage() {
  const { loading, fetchTodayRanking} = useRanking();
  const { currentCategoryName } = useCategory();

  return (
    <div className="flex flex-col h-full p-2 sm:p-4">
      <PageTitle
        title={`${currentCategoryName === 'total' ? "전체" : currentCategoryName} 랭킹`}
        description={`${currentCategoryName} 랭킹을 제공합니다.`}
      />
      <div className="flex flex-col py-4 sm:py-6 gap-3">
        <div className="flex items-center w-full gap-6">
          <CategorySwitcher />
          <RankingSelect />
          <MyButton isLoading={loading} onClick={fetchTodayRanking}>
            <Rss className="mr-2 h-4 w-4" />
            오늘의 랭킹 업데이트
          </MyButton>
        </div>
        <div className="flex gap-2">
          <RankingDetailTable />
        </div>
      </div>
    </div>
  );
}
