"use client";
import React from "react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { MarketService } from "@/lib/api";
import { handleApiError } from "@/lib/errorHandler";
import { MarketPlacePublic } from "@/client/management";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import MarketPlaceForm from "./MarketForm";
import DashboardCard from "@/components/common/card/DashboardCard";

/**
 * 카테고리 목록과 서브카테고리를 트리 형태로 보여주는 컴포넌트
 */

export default function MarketPlaceCard() {
  const [categories, setCategories] = useState<MarketPlacePublic[]>([]);

  // 카테고리 목록 가져오기
  const fetchCategories = async () => {
    try {
      const response = await MarketService.marketListMarkets();
      const categories = response.data;
      if (!categories) {
        return;
      }
      setCategories(categories);
    } catch (err) {
      handleApiError(err, (message) =>
        toast.error(message.title, { description: message.description })
      );
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);



  const handleDeleteClick = async (market: MarketPlacePublic) => {
    try {
      // await CatService.categoriesDeleteMarketPlace(market._id)
      await MarketService.marketDeleteMarket(market._id!);
      fetchCategories();
      toast.success("MarketPlace deleted successfully.", {
        description: `MarketPlace ${market.name} has been deleted.`,
      });
    } catch (err) {
      handleApiError(err, (message) =>
        toast.error(message.title, { description: message.description })
      );
    }
  };

  return (
    <DashboardCard
      title="마켓 플레이스"
      footer={<MarketPlaceForm mode="add" onSuccess={fetchCategories} />}
    >
      <ul className="space-y-3 overflow-y-auto">
        {categories.map((market) => (
          <li key={market._id} className="border-b pb-1 last:border-none">
            <div className="flex items-center justify-between px-2">
              <div className="f">{market.name}</div>
              <div className="space-x-1">
                <MarketPlaceForm mode="edit" market={market} onSuccess={fetchCategories} />
                <Button
                  variant={"ghost"}
                  onClick={() => handleDeleteClick(market)}
                  className="text-sm text-red-500 hover:underline"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </DashboardCard>
  );
}
