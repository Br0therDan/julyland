
import { CategoryContext } from '@/contexts/CategoryContext';
import { useContext } from 'react';

export const useCategory = () => {
  const context = useContext(CategoryContext);
  if (!context) {
    throw new Error("useCategory must be used within a CategoryProvider");
  }
  return context;
}