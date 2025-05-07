"use client";

import React, {
  createContext,
  useState,
  useEffect,
  useMemo, // ✅ useMemo 추가
} from "react";
import { ProductService, VariantService } from "@/lib/api";
import { ProductPublic, VariantPublic } from "@/client/management";
import { handleApiError } from "@/lib/errorHandler";
import { toast } from "sonner";
import { useCategory } from "@/hooks/useCategory";

interface ProductContextType {
  products: ProductPublic[];
  setProducts: React.Dispatch<React.SetStateAction<ProductPublic[]>>;
  selectedProduct: ProductPublic | undefined;
  setSelectedProduct: React.Dispatch<React.SetStateAction<ProductPublic | undefined>>;
  loading: boolean;
  variants: VariantPublic[];
  setVariants: React.Dispatch<React.SetStateAction<VariantPublic[]>>;
  fetchProductList: (categoryName?: string, brandName?: string) => Promise<void>;
  fetchProduct: (productId: string) => Promise<void>;
}

export const ProductContext = createContext<ProductContextType | undefined>(
  undefined
);

export const ProductProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { currentCategoryName, selectedBrand } = useCategory();
  const [ products, setProducts ] = useState<ProductPublic[]>([]);
  const [ selectedProduct, setSelectedProduct ] = useState<ProductPublic>();
  const [ variants, setVariants ] = useState<VariantPublic[]>([]);
  const [ loading, setLoading ] = useState<boolean>(true);

  const fetchProductList = async (catName?: string, brandName?: string) => {
    setLoading(true);
    try {
      const response = await ProductService.productListProducts(catName, brandName);
      setProducts(response.data);
      setSelectedProduct(response.data[0]);
    } catch (err) {
      handleApiError(err, (message) =>
        toast.error(message.title, { description: message.description })
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchProduct = async (productId: string) => {
    setLoading(true);
    try {
      const response = await ProductService.productReadProduct(productId);
      setSelectedProduct(response.data);
    } catch (err) {
      handleApiError(err, (message) =>
        toast.error(message.title, { description: message.description })
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProductList(currentCategoryName, selectedBrand?.name);
  }, [currentCategoryName, selectedBrand]); // ✅ 종속성 추가

  useEffect(() => {
    if (selectedProduct) {
      fetchProduct(selectedProduct._id);
    }
  }, []); // ✅ 종속성 추가

  const fetchVariants = async (productId?: string) => {
    setLoading(true);
    try {
      const query = productId || undefined
      const response = await VariantService.variantListVariants(
        query,
      );
      setVariants(response.data);
    } catch (err) {
      handleApiError(err, (message) =>
        toast.error(message.title, { description: message.description })
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedProduct) {
      fetchVariants();
    }
  }, [selectedProduct]); // ✅ 종속성 추가

  const value = useMemo(
    () => ({
      products,
      setProducts,
      selectedProduct,
      setSelectedProduct,
      loading,
      fetchProductList,
      fetchProduct,
      setVariants,
      variants,
    }),
    [ 
      products,
      selectedProduct,
      loading,
      fetchProductList,
      fetchProduct,
    ]
  ); // ✅ 의존성 명시

  return (
    <ProductContext.Provider value={value}>{children}</ProductContext.Provider>
  );
};
