"use client";

import React, {
  createContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import { BrandService, CategoryService } from "@/lib/api";
import { BrandPublic, CategoryPublic } from "@/client/management";
import { handleApiError } from "@/lib/errorHandler";
import { toast } from "sonner";

interface CategoryContextType {
  categories: CategoryPublic[];
  currentCategoryName: string;
  selectedCategory: CategoryPublic;
  setSelectedCategory: React.Dispatch<React.SetStateAction<CategoryPublic>>;
  setCurrentCategoryName: React.Dispatch<React.SetStateAction<string>>;
  brands: BrandPublic[];
  setBrands: React.Dispatch<React.SetStateAction<BrandPublic[]>>;
  selectedBrand: BrandPublic | undefined;
  setSelectedBrand: React.Dispatch<React.SetStateAction<BrandPublic | undefined>>;
  fetchBrands: (catName?: string) => Promise<void>;
  fetchCategories: () => Promise<void>;
}

export const CategoryContext = createContext<CategoryContextType | undefined>(
  undefined
);

export const CategoryProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [categories, setCategories] = useState<CategoryPublic[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<CategoryPublic>(categories[0]);
  const [currentCategoryName, setCurrentCategoryName] = useState<string>("total");
  const [brands, setBrands] = useState<BrandPublic[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<BrandPublic>();

  const fetchCategories = useCallback(async () => {
    try {
      const response = await CategoryService.categoryListCategories();
      setCategories(response.data);
      setSelectedCategory(response.data[0]);
      setCurrentCategoryName("total");
      setSelectedBrand(undefined);
      setBrands([]);   
    } catch (err) {
      handleApiError(err, (message) =>
        toast.error(message.title, { description: message.description })
      );
    }
  }, []);


  const fetchBrands = useCallback(async (catName?: string) => {
    try {
      const response = await BrandService.brandListBrands(catName);
      setBrands(response.data);
      setSelectedBrand(brands[0]);
    } catch (err) {
      handleApiError(err, (message) =>
        toast.error(message.title, { description: message.description })
      );
    }
  }, [currentCategoryName]);


  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    if (currentCategoryName) {
      fetchBrands(currentCategoryName);
    } else {
      fetchBrands();
    }
  }, [currentCategoryName]);


  const value = useMemo(
    () => ({
      categories,
      currentCategoryName,
      setCurrentCategoryName,
      selectedCategory,
      setSelectedCategory,
      brands,
      setBrands,
      selectedBrand,
      setSelectedBrand,
      fetchBrands,
      fetchCategories,
    }), // Removed setCurrentCategory from the value object
    [ categories, currentCategoryName, brands, selectedBrand, fetchBrands, fetchCategories ]
  );

  return (
    <CategoryContext.Provider value={value}>
      {children}
    </CategoryContext.Provider>
  );
};
