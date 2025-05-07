// Path: src/app/dashboard/rankings/layout.tsx
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardSidebar from "@/components/dashboard/Sidebar";
import { CategoryProvider } from "@/contexts/CategoryContext";
import { ProductProvider } from "@/contexts/ProductContext";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <CategoryProvider>
        <DashboardSidebar />
        <main className="flex flex-col bg-background min-h-screen w-full">
          <DashboardHeader />
          <div className="flex flex-1 flex-col mx-auto w-full justify-center gap-4">
            <ProductProvider>{children}</ProductProvider>
          </div>
        </main>
      </CategoryProvider>
    </>
  );
}
