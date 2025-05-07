
import { ProductContext } from '@/contexts/ProductContext';
import { useContext } from 'react';

export const useProduct = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error("useProduct must be used within a ProductProvider");
  }
  return context;
}