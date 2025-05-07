
import { RankingContext } from '@/contexts/RankingContext';
import { useContext } from 'react';

export const useRanking = () => {
  const context = useContext(RankingContext);
  if (!context) {
    throw new Error("useRanking must be used within a RankingProvider");
  }
  return context;
}