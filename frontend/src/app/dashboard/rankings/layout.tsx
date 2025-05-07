// Path: src/app/dashboard/rankings/layout.tsx

import { RankingProvider } from "@/contexts/RankingContext";

export default async function RankingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <RankingProvider>{children}</RankingProvider>;
}
