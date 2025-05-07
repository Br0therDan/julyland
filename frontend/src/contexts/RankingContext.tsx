"use client";

import React, {
  createContext,
  useState,
  useEffect,
  useMemo, // ✅ useMemo 추가
  useCallback, // ✅ useCallback 추가
} from "react";
import {
  RankingService,
} from "@/lib/api";
import {
  RankingPublic,
  RankingSnapshotPublic,
} from "@/client/management";
import { handleApiError } from "@/lib/errorHandler";
import { toast } from "sonner";
import { useCategory } from "@/hooks/useCategory";

interface RankingContextType {
  rankings: RankingPublic[];
  currentRankingSnapshot: RankingSnapshotPublic | undefined;
  rankingId: string | undefined;
  setRankingId: React.Dispatch<React.SetStateAction<string | undefined>>;
  loading: boolean;
  fetchRankingList: (categoryName: string) => Promise<void>;
  fetchRankingSnapshot: (rankingId: string) => Promise<void>;
  fetchTodayRanking: () => void;
  scrapeRanking: (category: string) => Promise<void>;
}

export const RankingContext = createContext<RankingContextType | undefined>(
  undefined
);

export const RankingProvider = ({
  children,
}: 
{
  children: React.ReactNode;
}) => {
  const [rankings, setRankings] = useState<RankingPublic[]>([]);
  const [rankingId, setRankingId] = useState<string>();
  const [currentRankingSnapshot, setCurrentRankingSnapshot] =
    useState<RankingSnapshotPublic>();
  const [loading, setLoading] = useState<boolean>(true);


  const { currentCategoryName } = useCategory();
  const fetchRankingList = useCallback(async (categoryName: string) => {
    // ✅ useCallback 적용
    setLoading(true);
    try {
      const response = await RankingService.rankingListRankings(categoryName);
      setRankings(response.data);
      setRankingId(response.data[0]?._id); // ✅ 안전한 접근
    } catch (err) {
      handleApiError(err, (message) =>
        toast.error(message.title, { description: message.description })
      );
    } finally {
      setLoading(false);
    }
  }, []); // ✅ 종속성 없음

  const fetchRankingSnapshot = useCallback(async (rankingId: string) => {
    // ✅ useCallback 적용
    setLoading(true);
    try {
      const response = await RankingService.rankingReadRankingSnapshot(
        rankingId
      );
      setCurrentRankingSnapshot(response.data);
    } catch (err) {
      handleApiError(err, (message) =>
        toast.error(message.title, { description: message.description })
      );
    } finally {
      setLoading(false);
    }
  }, []); // ✅ 종속성 없음

  const fetchTodayRanking = useCallback(async () => {
    // ✅ useCallback 적용
    setLoading(true);
    try {
      if (currentCategoryName) {
        await RankingService.rankingGetTodayRankings(currentCategoryName);
        toast.success("랭킹이 업데이트 되었습니다.");
      } else {
        toast.error("현재 카테고리가 설정되지 않았습니다.");
      }
    } catch (err) {
      handleApiError(err, (message) =>
        toast.error(message.title, { description: message.description })
      );
    } finally {
      setLoading(false);
      fetchRankingList(currentCategoryName); // ✅ 의존성 최적화를 위해 useCallback 내부에서 호출
    }
  }, [currentCategoryName, fetchRankingList]); // ✅ 의존성 추가

  const scrapeRanking = async (category: string) => {
    setLoading(true);
    try {
      const res = await RankingService.rankingScrapeAndReturn(category);
      setCurrentRankingSnapshot(res.data);
      toast.success("랭킹이 업데이트 되었습니다.");
    } catch (err) {
      handleApiError(err, (message) =>
        toast.error(message.title, { description: message.description })
      );
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRankingList(currentCategoryName); // ✅ useCallback으로 대체됨
  }, [currentCategoryName, fetchRankingList]);

  useEffect(() => {
    if (rankingId) {
      fetchRankingSnapshot(rankingId); // ✅ useCallback으로 대체됨
    }
  }, [rankingId, fetchRankingSnapshot]);

  const value = useMemo(
    () => ({
      rankings,
      currentRankingSnapshot,
      rankingId,
      setRankingId,
      loading,
      fetchRankingList,
      fetchRankingSnapshot,
      fetchTodayRanking,
      scrapeRanking,
    }),
    [
      rankings,
      currentRankingSnapshot,
      rankingId,
      loading,
      fetchRankingList,
      fetchRankingSnapshot,
      fetchTodayRanking,
    ]
  ); // ✅ 의존성 명시

  return (
    <RankingContext.Provider value={value}>{children}</RankingContext.Provider>
  );
};
